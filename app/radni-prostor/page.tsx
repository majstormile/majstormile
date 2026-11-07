import Workspace from '../workspace';
import AccessGate from '../access-gate';
// Sign-in and the workspace. The public product page is at "/".
export default function WorkspacePage(){return <AccessGate><Workspace/></AccessGate>}
