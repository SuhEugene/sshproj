import type ssh2 from 'ssh2';

export const clearScreen = (stream: ssh2.ServerChannel) => stream.write(`\x1b[2J\x1b[H`);
export const cursorHome = (stream: ssh2.ServerChannel) => stream.write('\x1b[H');
export const cursorLineStart = (stream: ssh2.ServerChannel) => stream.write('\x1b[0G');
export const moveCursorTo = (stream: ssh2.ServerChannel, x: number, y: number) => stream.write(`\x1b[${y};${x}H`);
export const moveCursorToX = (stream: ssh2.ServerChannel, x: number) => stream.write(`\x1b[${x}G`);
export const moveCursorByX = (stream: ssh2.ServerChannel, x: number) => stream.write(`\x1b[${Math.abs(x)}${x > 0 ? 'C' : 'D'}`);
export const moveCursorByY = (stream: ssh2.ServerChannel, y: number) => stream.write(`\x1b[${Math.abs(y)}${y > 0 ? 'B' : 'A'}`);
export const newLine = (stream: ssh2.ServerChannel, lines: number = 1) => stream.write('\n'.repeat(lines));
export const cursorHide = (stream: ssh2.ServerChannel) => stream.write('\x1b[?25l');
export const cursorShow = (stream: ssh2.ServerChannel) => stream.write('\x1b[?25h');
export const textBold = (stream: ssh2.ServerChannel) => stream.write(`\x1b[1m`);
export const textUnderline = (stream: ssh2.ServerChannel) => stream.write(`\x1b[4m`);
export const textReset = (stream: ssh2.ServerChannel) => stream.write(`\x1b[0m`);
export const textColor = (stream: ssh2.ServerChannel, color: number | string) => stream.write(`\x1b[38;5;${color}m`);
export const backgroundColor = (stream: ssh2.ServerChannel, color: number) => stream.write(`\x1b[48;5;${color}m`);