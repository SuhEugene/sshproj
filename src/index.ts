import ssh2 from 'ssh2';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  moveCursorToX,
  cursorHide,
  clearScreen,
  moveCursorTo,
  backgroundColor,
  textBold,
  textColor,
  textReset,
  newLine,
  textUnderline,
  cursorShow
} from './cursor.js';

dotenv.config();

interface TermSize {
  rows: number;
  cols: number;
}

function blockAlignCenter(stream: ssh2.ServerChannel, size: TermSize, length: number) {
  const centerX = Math.floor((size.cols - length) / 2);
  moveCursorToX(stream, centerX);
}

const lines = 5;
const username = 'SuhEugene';
const links = [
  '168 | Site     | https://suheugene.ru',
  '111 | Telegram | https://t.me/suheugene',
  '15  | GitHub   | https://github.com/SuhEugene'
];
function displayInfo(stream: ssh2.ServerChannel, size: TermSize) {
  cursorHide(stream);
  clearScreen(stream);
  // Cursor to the center
  moveCursorTo(stream, Math.floor((size.cols - lines) / 2), Math.floor((size.rows - lines) / 2));
  blockAlignCenter(stream, size, username.length + 2);
  backgroundColor(stream, 32);
  textBold(stream);
  textColor(stream, 0);
  stream.write(` ${username} `);
  textReset(stream);
  newLine(stream, 2);

  const longestName = Math.max(...links.map(link => link.split(/ +\| +/)[1].length));
  const longestUrl = Math.max(...links.map(link => link.split(/ +\| +/)[2].length));

  const biggestLine = longestName + longestUrl;
  for (const link of links) {
    blockAlignCenter(stream, size, biggestLine);
    const linkParts = link.split(/ +\| +/);
    const [linkColor, linkName, linkUrl] = linkParts;

    textBold(stream);
    textColor(stream, linkColor);
    stream.write(' '.repeat(longestName - linkName.length));
    stream.write(linkName);
    textReset(stream);
    stream.write(': ');
    textUnderline(stream);
    stream.write(linkUrl);
    textReset(stream);
    newLine(stream);
  }

  moveCursorTo(stream, 0, size.rows - 1);
}

const filePath = fileURLToPath(import.meta.url);
const hostKey = readFileSync(path.join(dirname(filePath), '../keys/id_rsa'));

const server = new ssh2.Server(
  {
    hostKeys: [{ key: hostKey, passphrase: process.env.ID_PASSPHRASE }]
  },
  (client, info) => {
    client.on('authentication', ctx => {
      if (ctx.username === "root")
        return client.end();

      console.log('Client with username', ctx.username, 'authenticated.');
      ctx.accept()
    });
    client.on('ready', () => {
      console.log('Client is ready.');
      const clientTermSize: TermSize = { rows: 24, cols: 80 };
      let globStream: ssh2.ServerChannel | null = null;

      client.on('session', accept => {
        const session = accept();

        session.on('pty', (_accept, reject, info) => {
          clientTermSize.cols = info.cols;
          clientTermSize.rows = info.rows;
          if (globStream) displayInfo(globStream, clientTermSize);
        });

        session.on('window-change', (_accept, _reject, info) => {
          clientTermSize.cols = info.cols;
          clientTermSize.rows = info.rows;
          if (globStream) displayInfo(globStream, clientTermSize);
        });

        session.on('shell', async accept => {
          const stream = accept();
          globStream = stream;

          displayInfo(stream, clientTermSize);
          stream.on('data', () => displayInfo(stream, clientTermSize));

          stream.on('close', () => {
            clearScreen(stream);
            cursorShow(stream);
            console.log('Connection closed.');
          });

          stream.on('error', (err: string) => {
            console.error('Stream error:', err);
          });
        });
      });
    });

    client.on('error', err => {
      console.error('Client error:', err);
    });

    client.on('end', () => {
      console.log('Client disconnected.');
    });
  }
);

server.listen(2222, '0.0.0.0', () => {
  console.log('SSH server listening on port 2222');
});
