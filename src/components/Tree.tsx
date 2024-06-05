import React, { useMemo, useRef, useState } from "react";
import {
  extent,
  forceCollide,
  forceSimulation,
  forceX,
  forceY,
  hierarchy,
  pack,
  HierarchyNode,
  scaleLinear,
  scaleSqrt,
  timeFormat,
} from "d3";
import { FileType } from "./types";
import countBy from "lodash/countBy";
import maxBy from "lodash/maxBy";
import entries from "lodash/entries";
import uniqBy from "lodash/uniqBy";
import flatten from "lodash/flatten";
// file colors are from the github/linguist repo
import defaultFileColors from "./language-colors.json";
import { CircleText } from "./CircleText";
import {
  keepBetween,
  keepCircleInsideCircle,
  truncateString,
} from "./utils";

type Props = {
  data: FileType;
  filesChanged: string[];
  maxDepth: number;
  colorEncoding: "type" | "number-of-changes" | "last-change"
  customFileColors?: { [key: string]: string };
};
type ExtendedFileType = {
  extension?: string;
  pathWithoutExtension?: string;
  label?: string;
  color?: string;
  value?: number;
  sortOrder?: number;
  fileColors?: { [key: string]: string };
} & FileType;
type ProcessedDataItem = {
  data: ExtendedFileType;
  depth: number;
  height: number;
  r: number;
  x: number;
  y: number;
  parent: ProcessedDataItem | null;
  children: Array<ProcessedDataItem>;
};
const looseFilesId = "__structure_loose_file__";
const width = 1000;
const height = 1000;
const maxChildren = 9000;
const lastCommitAccessor = (d) => new Date(d.commits?.[0]?.date + "0");
const numberOfCommitsAccessor = (d) => d?.commits?.length || 0;
export const Tree = (
  { data, filesChanged = [], maxDepth = 9, colorEncoding = "type", customFileColors}:
    Props,
) => {
  const fileColors = { ...defaultFileColors, ...customFileColors };
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const cachedPositions = useRef<{ [key: string]: [number, number] }>({});
  const cachedOrders = useRef<{ [key: string]: string[] }>({});

  const { colorScale, colorExtent } = useMemo(() => {
    if (!data) return { colorScale: () => { }, colorExtent: [0, 0] };
    const flattenTree = (d) => {
      return d.children ? d.children.flatMap(flattenTree) : d;
    };
    const items = flattenTree(data);
    const flatTree = colorEncoding === "last-change"
      ? items.map(lastCommitAccessor).sort((a, b) => b - a).slice(0, -8)
      : items.map(numberOfCommitsAccessor).sort((a, b) => b - a).slice(2, -2);
  
    const colorExtent = extent(flatTree).map(Number);
  
    const colors = [
      "#f4f4f4",
      "#f4f4f4",
      "#f4f4f4",
      colorEncoding === "last-change" ? "#C7ECEE" : "#FEEAA7",
      colorEncoding === "number-of-changes" ? "#3C40C6" : "#823471",
    ];
  
    if (Array.isArray(colorExtent) && colorExtent.length === 2 && !isNaN(colorExtent[0]) && !isNaN(colorExtent[1])) {
      const colorScale2 = scaleLinear()
        .domain(colorExtent)
        .range([0, colors.length - 1])
        .clamp(true);
  
      const getColor = (value) => {
        const colorIndex = Math.round(colorScale2(value));
        return colors[colorIndex];
      };
  
      return { colorScale: getColor, colorExtent };
    } else {
      return { colorScale: () => { }, colorExtent: [0, 0] };
    }
  }, [data, colorEncoding]);

  const getColor = (d) => {
    if (colorEncoding === "type") {
      const isParent = !!d.children;
      if (isParent) {
        const extensions = countBy(d.children, (c) => c.extension);
        const mainExtension = maxBy(entries(extensions), ([k, v]) => v)?.[0];
        return mainExtension && fileColors[mainExtension] ? fileColors[mainExtension] : "#CED6E0";
      }
      return fileColors[d.extension] || "#CED6E0";
    } else if (colorEncoding === "number-of-changes") {
      return colorScale(numberOfCommitsAccessor(d)) || "#f4f4f4";
    } else if (colorEncoding === "last-change") {
      return colorScale(lastCommitAccessor(d)) || "#f4f4f4";
    }
  };

  const packedData = useMemo(() => {
    if (!data) return [];
    const hierarchicalData = hierarchy(
      processChild(data, getColor, cachedOrders.current, 0, fileColors),
    ).sum((d) => d.value ?? 0)  as HierarchyNode<ExtendedFileType>; 

    let packedTree = pack()
      .size([width, height * 1.3]) 
      .padding((d: HierarchyNode<ExtendedFileType>) => { 
        if (d.depth <= 0) return 0;
        const hasChildWithNoChildren = d.children
          ? d.children.filter((d) => !d.children?.length).length > 1
          : false;
        if (hasChildWithNoChildren) return 5;
        return 13;
      })(hierarchicalData); 

    // Apply direct type assertion 
    packedTree.children = reflowSiblings(
      packedTree.children as ProcessedDataItem[], 
      cachedPositions.current,
      maxDepth,
    );
    const children = packedTree.descendants() as ProcessedDataItem[];

    cachedOrders.current = {};
    cachedPositions.current = {};
    const saveCachedPositionForItem = (item) => {
      cachedOrders.current[item.data.path] = item.data.sortOrder;
      if (item.children) {
        item.children.forEach(saveCachedPositionForItem);
      }
    };
    saveCachedPositionForItem(packedTree);
    children.forEach((d) => {
      cachedPositions.current[d.data.path] = [d.x, d.y];
    });

    return children.slice(0, maxChildren);
  }, [data, fileColors, colorEncoding]);

  const selectedNode = selectedNodeId &&
    packedData.find((d) => d.data.path === selectedNodeId);

  const fileTypes = uniqBy(
    packedData.map((d) => fileColors[d.data.extension] && d.data.extension),
  ).sort().filter(Boolean);


  return (
    <svg
      width={width}
      height={height}
      style={{
        background: "white",
        fontFamily: "sans-serif",
        overflow: "visible",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {packedData.map(({ x, y, r, depth, data, children, ...d }) => {
        if (depth <= 0) return null;
        if (depth > maxDepth) return null;
        const isOutOfDepth = depth >= maxDepth;
        const isParent = !!children;
        let runningR = r;
        // if (depth <= 1 && !children) runningR *= 3;
        if (data.path === looseFilesId) return null;
        const isHighlighted = filesChanged.includes(data.path);
        const doHighlight = !!filesChanged.length;

        return (
          <g
            key={data.path}
            style={{
              fill: doHighlight
                ? isHighlighted ? "#FCE68A" : "#ECEAEB"
                : data.color,
              transition: `transform ${isHighlighted ? "0.5s" : "0s"
                } ease-out, fill 0.1s ease-out`,
              // opacity: doHighlight && !isHighlighted ? 0.6 : 1,
            }}
            transform={`translate(${x}, ${y})`}
          >
            {isParent
              ? (
                <>
                  <circle
                    r={r}
                    style={{ transition: "all 0.5s ease-out" }}
                    stroke="#290819"
                    strokeOpacity="0.2"
                    strokeWidth="1"
                    fill="white"
                  />
                </>
              )
              : (
                <circle
                  style={{
                    filter: isHighlighted ? "url(#glow)" : undefined,
                    transition: "all 0.5s ease-out",
                  }}
                  r={runningR}
                  strokeWidth={selectedNodeId === data.path ? 3 : 0}
                  stroke="#374151"
                />
              )}
          </g>
        );
      })}

      {packedData.map(({ x, y, r, depth, data, children }) => {
        if (depth <= 0) return null;
        if (depth > maxDepth) return null;
        const isParent = !!children && depth !== maxDepth;
        if (!isParent) return null;
        if (data.path === looseFilesId) return null;
        if (r < 16 && selectedNodeId !== data.path) return null;
        if (data.label.length > r * 0.5) return null;

        const label = truncateString(
          data.label,
          r < 30 ? Math.floor(r / 2.7) + 3 : 100,
        );

        let offsetR = r + 12 - depth * 4;
        const fontSize = 16 - depth;

        return (
          <g
            key={data.path}
            style={{ pointerEvents: "none", transition: "all 0.5s ease-out" }}
            transform={`translate(${x}, ${y})`}
          >
            <CircleText
              style={{ fontSize, transition: "all 0.5s ease-out" }}
              r={Math.max(20, offsetR - 3)}
              fill="#374151"
              stroke="white"
              strokeWidth="6"
              rotate={depth * 1 - 0}
              text={label}
            />
            <CircleText
              style={{ fontSize, transition: "all 0.5s ease-out" }}
              fill="#374151"
              rotate={depth * 1 - 0}
              r={Math.max(20, offsetR - 3)}
              text={label}
            />
          </g>
        );
      })}

      {packedData.map(({ x, y, r, depth, data, children }) => {
        if (depth <= 0) return null;
        if (depth > maxDepth) return null;
        const isParent = !!children;
        // if (depth <= 1 && !children) runningR *= 3;
        if (data.path === looseFilesId) return null;
        const isHighlighted = filesChanged.includes(data.path);
        const doHighlight = !!filesChanged.length;
        if (isParent && !isHighlighted) return null;
        if (selectedNodeId === data.path && !isHighlighted) return null;
        if (
          !(isHighlighted ||
            (!doHighlight && !selectedNode) && r > 22)
        ) {
          return null;
        }

        const label = isHighlighted
          ? data.label
          : truncateString(data.label, Math.floor(r / 4) + 3);

        return (
          <g
            key={data.path}
            style={{
              fill: doHighlight
                ? isHighlighted ? "#FCE68A" : "#29081916"
                : data.color,
              transition: `transform ${isHighlighted ? "0.5s" : "0s"} ease-out`,
            }}
            transform={`translate(${x}, ${y})`}
          >
            <text
              style={{
                pointerEvents: "none",
                opacity: 0.9,
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.5s ease-out",
              }}
              fill="#4B5563"
              textAnchor="middle"
              dominantBaseline="middle"
              stroke="white"
              strokeWidth="3"
              strokeLinejoin="round"
            >
              {label}
            </text>
            <text
              style={{
                pointerEvents: "none",
                opacity: 1,
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.5s ease-out",
              }}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {label}
            </text>
            <text
              style={{
                pointerEvents: "none",
                opacity: 0.9,
                fontSize: "14px",
                fontWeight: 500,
                mixBlendMode: "color-burn",
                transition: "all 0.5s ease-out",
              }}
              fill="#110101"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {label}
            </text>
          </g>
        );
      })}

      {!filesChanged.length && colorEncoding === "type" &&
        <Legend fileTypes={fileTypes} fileColors={fileColors}/>}
      {!filesChanged.length && colorEncoding !== "type" &&
        <ColorLegend scale={colorScale} extent={colorExtent} colorEncoding={colorEncoding} />}
    </svg>
  );
};

const formatD = (d) => (
  typeof d === "number" ? d : timeFormat("%b %Y")(d)
);
const ColorLegend = ({ scale, extent, colorEncoding }) => {
  if (!scale || !scale.ticks) return null;
  const ticks = scale.ticks(10);
  return (
    <g
      transform={`translate(${width - 160}, ${height - 90})`}
    >
      <text
        x={50}
        y="-5"
        fontSize="10"
        textAnchor="middle"
      >
        {/* @ts-ignore */}
        {colorEncoding === "number-of-changes" ? "Number of changes" : "Last change date"}
      </text>
      <linearGradient id="gradient">
        {ticks.map((tick, i) => {
          const color = scale(tick);
          return (
            <stop offset={i / (ticks.length - 1)} stopColor={color} key={i} />
          );
        })}
      </linearGradient>
      <rect x="0" width="100" height="13" fill="url(#gradient)" />
      {extent.map((d, i) => (
        <text
          key={i}
          x={i ? 100 : 0}
          y="23"
          fontSize="10"
          textAnchor={i ? "end" : "start"}
        >
          {formatD(d)}
        </text>
      ))}
    </g>
  );
};

const Legend = ({ fileTypes = [], fileColors}) => {
  return (
    <g
      transform={`translate(${width - 60}, ${height - fileTypes.length * 15 -
        20})`}
    >
      {fileTypes.map((extension, i) => (
        <g key={i} transform={`translate(0, ${i * 15})`}>
          <circle
            r="5"
            fill={fileColors[extension]}
          />
          <text
            x="10"
            style={{ fontSize: "14px", fontWeight: 300 }}
            dominantBaseline="middle"
          >
            .{extension}
          </text>
        </g>
      ))}
      <g
        fill="#9CA3AF"
        style={{
          fontWeight: 300,
          fontStyle: "italic",
          fontSize: 12,
        }}
      >
        each dot sized by file size
      </g>
    </g>
  );
};

const processChild = (
  child: FileType | undefined,
  getColor: (d: ExtendedFileType) => string,
  cachedOrders: { [key: string]: number },
  i = 0,
  fileColors: { [key: string]: string },
): ExtendedFileType | undefined => {
  if (!child) return undefined;

  try {
    const isRoot = !child.path;

    // Calculate new name and path based on children (if applicable)
    const hasSingleChild = child.children && child.children.length === 1;
    const newName = hasSingleChild 
        ? `${child.name}/${child.children[0].name}` 
        : child.name;
    const newPath = hasSingleChild
        ? child.children[0].path
        : child.path;

    // Process children recursively (filtering out undefined results)
    const newChildren: ExtendedFileType[] = child.children
      ? child.children
          .map((c, i) => processChild(c, getColor, cachedOrders, i, fileColors))
          .filter((c): c is ExtendedFileType => !!c)
      : [];

    const pathWithoutExtension = newPath ? newPath.split(".").slice(0, -1).join(".") : undefined;
    const extension = newName ? newName.split(".").slice(-1)[0] : undefined;
    const hasExtension = extension ? !!fileColors[extension] : false;

    // Add loose files at the root level
    const processedChildren = isRoot && newChildren
      ? [...newChildren, { 
            name: looseFilesId,
            path: looseFilesId,
            size: 0,
            children: newChildren.filter((d) => !d.children?.length),
        }]
      : newChildren; 

    // Create the extended child object (immutable)
    const extendedChild: ExtendedFileType = {
      ...child,
      name: newName,
      path: newPath,
      label: newName,
      extension,
      pathWithoutExtension,
      size: (extension && ["woff", "woff2", "ttf", "otf", "png", "jpg", "svg"].includes(extension)
          ? 100
          : Math.min(
            15000,
            hasExtension ? child.size : Math.min(child.size, 9000),
          )) + i,
      value: (extension && ["woff", "woff2", "ttf", "otf", "png", "jpg", "svg"].includes(extension)
          ? 100
          : Math.min(
            15000,
            hasExtension ? child.size : Math.min(child.size, 9000),
          )) + i,
      color: "#fff",
      children: processedChildren,
    };

    // Calculate color and sortOrder (doesn't mutate extendedChild)
    const color = getColor(extendedChild);
    const sortOrder = getSortOrder(extendedChild, cachedOrders, i);

    // Return a new object with calculated values
    return { ...extendedChild, color, sortOrder }; 

  } catch (error) {
    console.error(`Error processing child node: ${child.path}`, error);
    return undefined; 
  }
};

const reflowSiblings = (
  siblings: ProcessedDataItem[],
  cachedPositions: Record<string, [number, number]> = {},
  maxDepth: number,
  parentRadius?: number,
  parentPosition?: [number, number],
) => {
  if (!siblings) return;
  let items = [...siblings.map((d) => {
    return {
      ...d,
      x: cachedPositions[d.data.path]?.[0] || d.x,
      y: cachedPositions[d.data.path]?.[1] || d.y,
      originalX: d.x,
      originalY: d.y,
    };
  })];
  const paddingScale = scaleSqrt().domain([maxDepth, 1]).range([3, 8]).clamp(
    true,
  );
  let simulation = forceSimulation(items)
    .force(
      "centerX",
      forceX(width / 2).strength(items[0].depth <= 2 ? 0.01 : 0),
    )
    .force(
      "centerY",
      forceY(height / 2).strength(items[0].depth <= 2 ? 0.01 : 0),
    )
    .force(
      "centerX2",
      forceX(parentPosition?.[0]).strength(parentPosition ? 0.3 : 0),
    )
    .force(
      "centerY2",
      forceY(parentPosition?.[1]).strength(parentPosition ? 0.8 : 0),
    )
    .force(
      "x",
      forceX((d) => cachedPositions[d.data.path]?.[0] || width / 2).strength(
        (d) =>
          cachedPositions[d.data.path]?.[1] ? 0.5 : ((width / height) * 0.3),
      ),
    )
    .force(
      "y",
      forceY((d) => cachedPositions[d.data.path]?.[1] || height / 2).strength(
        (d) =>
          cachedPositions[d.data.path]?.[0] ? 0.5 : ((height / width) * 0.3),
      ),
    )
    .force(
      "collide",
      forceCollide((d) => d.children ? d.r + paddingScale(d.depth) : d.r + 1.6)
        .iterations(8).strength(1),
    )
    .stop();

  for (let i = 0; i < 280; i++) {
    simulation.tick();
    items.forEach((d) => {
      d.x = keepBetween(d.r, d.x, width - d.r);
      d.y = keepBetween(d.r, d.y, height - d.r);

      if (parentPosition && parentRadius) {
        // keep within radius
        const containedPosition = keepCircleInsideCircle(
          parentRadius,
          parentPosition,
          d.r,
          [d.x, d.y],
          !!d.children?.length,
        );
        d.x = containedPosition[0];
        d.y = containedPosition[1];
      }
    });
  }
  // setTimeout(() => simulation.stop(), 100);
  const repositionChildren = (d, xDiff, yDiff) => {
    let newD = { ...d };
    newD.x += xDiff;
    newD.y += yDiff;
    if (newD.children) {
      newD.children = newD.children.map((c) =>
        repositionChildren(c, xDiff, yDiff)
      );
    }
    return newD;
  };
  for (const item of items) {
    const itemCachedPosition = cachedPositions[item.data.path] ||
      [item.x, item.y];
    const itemPositionDiffFromCached = [
      item.x - itemCachedPosition[0],
      item.y - itemCachedPosition[1],
    ];

    if (item.children) {
      let repositionedCachedPositions = { ...cachedPositions };
      const itemReflowDiff = [
        item.x - item.originalX,
        item.y - item.originalY,
      ];

      item.children = item.children.map((child) =>
        repositionChildren(
          child,
          itemReflowDiff[0],
          itemReflowDiff[1],
        )
      );
      if (item.children.length > 4) {
        if (item.depth > maxDepth) return;
        item.children.forEach((child) => {
          // move cached positions with the parent
          const childCachedPosition =
            repositionedCachedPositions[child.data.path];
          if (childCachedPosition) {
            repositionedCachedPositions[child.data.path] = [
              childCachedPosition[0] + itemPositionDiffFromCached[0],
              childCachedPosition[1] + itemPositionDiffFromCached[1],
            ];
          } else {
            // const diff = getPositionFromAngleAndDistance(100, item.r);
            repositionedCachedPositions[child.data.path] = [
              child.x,
              child.y,
            ];
          }
        });
        item.children = reflowSiblings(
          item.children,
          repositionedCachedPositions,
          maxDepth,
          item.r,
          [item.x, item.y],
        );
      }
    }
  }
  return items;
};

const getSortOrder = (item: ExtendedFileType, cachedOrders, i = 0) => {
  if (cachedOrders[item.path]) return cachedOrders[item.path];
  if (cachedOrders[item.path?.split("/")?.slice(0, -1)?.join("/")]) {
    return -100000000;
  }
  if (item.name === "public") return -1000000;
  // if (item.depth <= 1 && !item.children) {
  //   // item.value *= 0.33;
  //   return item.value  * 100;
  // }
  // if (item.depth <= 1) return -10;
  return item.value + -i;
  // return b.value - a.value;
};
