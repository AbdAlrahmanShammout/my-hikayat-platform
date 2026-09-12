import { ResourceConflictException } from '@/common/exceptions/resource-conflict.exception';
import { OFFLINE_DOWNLOAD_MAX_ACTIVE } from '@/modules/offline-download/consts/offline-download.constant';

export class OfflineDownloadLimitReachedException extends ResourceConflictException {
  constructor() {
    super({
      message: `You can keep up to ${OFFLINE_DOWNLOAD_MAX_ACTIVE} downloaded books at once. Remove one to download another.`,
      code: 'OFFLINE_DOWNLOAD_LIMIT_REACHED',
    });
  }
}
