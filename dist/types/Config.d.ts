export declare type Config = {
    default: {
        [key: string]: any;
    };
    commands: {
        [key: string]: any;
        build: {
            image: {
                [key: string]: any;
            };
        };
        run: {
            container: {
                [key: string]: any;
            };
        };
    };
};
