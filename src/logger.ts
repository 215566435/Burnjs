class Log {
    blue(str: string | any) {
        console.log(`logs:\x1b[34m ${str}\x1b[0m`);
    }
}

export default new Log;
