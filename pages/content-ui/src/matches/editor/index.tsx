import { initAppWithShadow } from '@extension/shared'
import App from '@src/matches/editor/App'
import inlineCss from '../../../dist/editor/index.css?inline'

initAppWithShadow({ id: 'CEB-extension-editor', app: <App />, inlineCss })
