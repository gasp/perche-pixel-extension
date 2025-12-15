import inlineCss from '../../../dist/editor/index.css?inline'
import { initAppWithShadow } from '@extension/shared'
import App from '@src/matches/editor/App'

initAppWithShadow({ id: 'CEB-extension-editor', app: <App />, inlineCss })
