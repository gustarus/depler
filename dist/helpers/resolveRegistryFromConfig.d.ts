export default function resolveRegistryFromConfig(registry?: {
    username: string;
    password: string;
    host: string;
    path: string;
}): false | {
    username: string;
    password: string;
    host: string;
    path: string;
};
