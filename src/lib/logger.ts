import { warn, debug, trace, info, error } from '@tauri-apps/plugin-log';

function forwardConsole(
    fnName: 'log' | 'debug' | 'info' | 'warn' | 'error',
    logger: (...data: any[]) => Promise<void>
) {
    const original = console[fnName];
    console[fnName] = (...data: unknown[]) => {
        original(...data);
        if (typeof data[0] === "string") {
            logger(data[0]);
        }
    };
}

console.log
export function initLogger() {
    const levels: ['log' | 'debug' | 'info' | 'warn' | 'error', logger: (...data: any[]) => Promise<void>][] = [["log", trace], ["debug", debug], ["info", info], ["warn", warn], ["error", error]];
    for (const [key, fn] of levels) forwardConsole(key, fn);

}