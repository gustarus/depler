export default function resolveRegistryTagFromConfig(registry?: {
    username: string;
    password: string;
    host: string;
    path: string;
}): false | string;
