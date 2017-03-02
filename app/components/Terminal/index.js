import React from 'react';
import Xterm from 'xterm';
import Docker from 'dockerode';
import fs from 'fs';

const shellPrompt = '> ';

export default class Terminal extends React.Component {
  componentDidMount() {
    const term = new Xterm();

    term.prompt = () => {
      term.write(`\r\n${shellPrompt}`);
    };

    term.open(this.terminalDiv);
    term.on('key', (key, ev) => this.stream.write(key));

    const docker = new Docker({
      host: 'https://192.168.99.100',
      port: 2376,
      ca: fs.readFileSync('/Users/jcrygier/.docker/machine/machines/default/ca.pem'),
      cert: fs.readFileSync('/Users/jcrygier/.docker/machine/machines/default/cert.pem'),
      key: fs.readFileSync('/Users/jcrygier/.docker/machine/machines/default/key.pem'),
    });
    const container = docker.getContainer('62c5ef45e1c6');
    container.inspect((inspectErr, inspectDetails) => {
      container.exec({ Cmd: ['bash'], AttachStdin: true, AttachStdout: true, AttachStderr: true, Tty: true }, (err, exec) => {
        console.log('Got Exec: ', err, exec, inspectDetails);
        exec.start({ detach: false, hijack: true, stdin: true, Tty: true }, (execStartErr, stream) => {
          this.stream = stream;
          console.log('Started Exec: ', err, stream);

          term.writeln(`Connected to Container: ${inspectDetails.Name}`);
          term.writeln('Closing this window will automatically disconnect you from your shell');
          term.writeln('');
          // const termProxy = { write: (buf) => term.write(buf.toString()) };
          // exec.modem.demuxStream(stream, termProxy, termProxy);

          stream.on('readable', () => {
            let readByte = stream.read(1);
            while (readByte != null) {
              term.write(readByte.toString());
              readByte = stream.read(1);
            }
          });
        });
      });
    });
  }

  componentWillUnmount() {
    if (this.stream) {
      this.stream.write('exit\n');    // TODO: Can't we just close the stream somehow?  If we go into a subshell, or aren't in a shell, this won't work
    }
  }

  render() {
    return (
      <div id="terminal-container" ref={node => this.terminalDiv = node} />
    );
  }
}
