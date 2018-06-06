import React from 'react';
import Xterm from 'xterm';
import Fit from 'xterm/dist/addons/fit/fit';
import Docker from 'dockerode';
import fs from 'fs';

const shellPrompt = '> ';

export default class Terminal extends React.Component {
  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions.bind(this));
    const term = new Xterm();
    this.term = term;

    term.open(this.terminalDiv);
    term.on('key', (key, ev) => this.stream.write(key));

    const docker = new Docker({
      host: `https://${this.props.serviceInstance.serverName}`,                              // TODO: Don't hardcode https
      port: 2376,
      ca: fs.readFileSync('/Users/jcrygier/.docker/machine/machines/default/ca.pem'),
      cert: fs.readFileSync('/Users/jcrygier/.docker/machine/machines/default/cert.pem'),
      key: fs.readFileSync('/Users/jcrygier/.docker/machine/machines/default/key.pem'),
    });
    const container = docker.getContainer(this.props.serviceInstance.containerId);
    container.inspect((inspectErr, inspectDetails) => {
      container.exec({ Cmd: ['bash'], AttachStdin: true, AttachStdout: true, AttachStderr: true, Tty: true }, (err, exec) => {
        exec.start({ detach: false, hijack: true, stdin: true, Tty: true }, (execStartErr, stream) => {
          this.exec = exec;
          this.stream = stream;
          this.updateDimensions();

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
      this.stream = null;
    }
  }

  updateDimensions() {
    if (this.stream) {
      Fit.fit(this.term);
      const geometry = Fit.proposeGeometry(this.term);
      this.exec.resize({ h: geometry.rows, w: geometry.cols }, (err) => console.log('Dimensions Updated', err, geometry));
    }
  }

  render() {
    return (
      <div id="terminal-container" style={{ height: '500px' }} ref={node => this.terminalDiv = node} />
    );
  }
}
