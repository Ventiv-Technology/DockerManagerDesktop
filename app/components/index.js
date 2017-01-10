import { Button as osxButton } from 'react-desktop/macOs';
import { Button as winButton } from 'react-desktop/windows';

export default {
  Button: process.platform === 'darwin' ? osxButton : winButton
};
