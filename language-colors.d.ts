declare module "*.json" {
    const value: { [key: string]: string }; // Adjust the type if needed
    export default value;
  }