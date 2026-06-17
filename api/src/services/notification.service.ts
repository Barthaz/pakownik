export class NotificationService {
  async sendShareInvite(
    _recipientEmail: string,
    _listName: string,
    _sharedByEmail: string,
  ): Promise<void> {
    // Stub — future SMTP integration
  }
}
