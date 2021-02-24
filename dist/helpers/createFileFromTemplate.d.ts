declare type Variables = {
    [key: string]: boolean | string | Variables[];
};
export default function createFileFromTemplate(pathToTemplate: string, pathToTarget: string, variables?: Variables): void;
export {};
