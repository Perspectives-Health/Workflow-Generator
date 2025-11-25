import { registerBackgroundRoutes } from '@/modules/shared/infrastructure/register-routes.background';
import { registerBrowserAction } from '@/modules/shared/actions';


export default defineBackground({
  async main() {
    registerBackgroundRoutes();
    registerBrowserAction();
  }
});
