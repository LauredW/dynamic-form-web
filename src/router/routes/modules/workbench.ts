import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const dashboard: AppRouteModule = {
  path: '/workbench',
  name: 'Workbench',
  component: LAYOUT,
  redirect: '/workbench',
  meta: {
    orderNo: 10,
    icon: 'ion:grid-outline',
    title: t('routes.workbench.workbench'),
  },
  children: [
    {
      path: 'manufacutre-form',
      name: 'ManufacutreForm',
      component: () => import('/@/views/workbench/manufacutre-form/index.vue'),
      meta: {
        title: t('routes.workbench.manufactureForm'),
      },
    },
  ],
};

export default dashboard;
