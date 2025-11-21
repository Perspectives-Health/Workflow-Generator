import { registerBackgroundRoutes } from '@/modules/shared/infrastructure/register-routes.background';


export default defineBackground({
  async main() {
    registerBackgroundRoutes();
  }
});
