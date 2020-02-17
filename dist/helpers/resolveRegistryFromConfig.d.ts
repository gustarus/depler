export default function resolveRegistryFromConfig(config: {
    [key: string]: any;
}): false | {
    username: string;
    password: string;
    host: string;
    path: string;
};
