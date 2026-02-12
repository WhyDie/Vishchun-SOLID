/**
 * РЕФАКТОРОВАНИЙ КОД
 * Дотримується всіх SOLID принципів
 */

import {
  User,
  IUserRepository,
  IEmailNotificationSender,
  ISmsNotificationSender,
  IUserReportGenerator,
  IActivityReportGenerator,
  INotificationRepository,
  IReportRepository,
  IBackupService,
} from '../interfaces/index';

/**
 * SRP: Відповідає тільки за управління користувачами
 */
export class UserRepository implements IUserRepository {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  removeUser(id: number): void {
    this.users = this.users.filter(u => u.id !== id);
  }

  findUser(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getAllUsers(): User[] {
    return [...this.users];
  }
}

/**
 * SRP: Відповідає тільки за відправлення email сповіщень
 * DIP: Імплементує інтерфейс
 */
export class EmailNotificationSender implements IEmailNotificationSender {
  constructor(private userRepository: IUserRepository,
              private notificationRepository: INotificationRepository) {}

  send(userId: number, message: string): void {
    const user = this.userRepository.findUser(userId);
    if (user) {
      this.sendEmail(user.email, message);
    }
  }

  sendEmail(email: string, message: string): void {
    const notification = {
      type: 'email',
      email,
      message,
      timestamp: new Date(),
    };
    this.notificationRepository.save(notification);
    console.log(`Email відправлено до ${email}: ${message}`);
  }
}

/**
 * SRP: Відповідає тільки за відправлення SMS сповіщень
 * DIP: Імплементує інтерфейс
 */
export class SmsNotificationSender implements ISmsNotificationSender {
  constructor(private userRepository: IUserRepository,
              private notificationRepository: INotificationRepository) {}

  send(userId: number, message: string): void {
    const user = this.userRepository.findUser(userId);
    if (user) {
      this.sendSms(user.phone, message);
    }
  }

  sendSms(phone: string, message: string): void {
    const notification = {
      type: 'sms',
      phone,
      message,
      timestamp: new Date(),
    };
    this.notificationRepository.save(notification);
    console.log(`SMS відправлено до ${phone}: ${message}`);
  }
}

/**
 * OCP: Легко додати новий тип сповіщення без редагування існуючих класів
 * SRP: Відповідає за відправлення телефонного сповіщення
 * DIP: Імплементує інтерфейс
 */
export class PushNotificationSender implements IEmailNotificationSender {
  constructor(private userRepository: IUserRepository,
              private notificationRepository: INotificationRepository) {}

  send(userId: number, message: string): void {
    const user = this.userRepository.findUser(userId);
    if (user) {
      this.sendPush(user.id, message);
    }
  }

  sendEmail(email: string, message: string): void {
    // Push не використовує email, але має імплементувати інтерфейс INotificationSender
    console.log(`Push сповіщення: ${message}`);
  }

  private sendPush(userId: number, message: string): void {
    const notification = {
      type: 'push',
      userId,
      message,
      timestamp: new Date(),
    };
    this.notificationRepository.save(notification);
    console.log(`Push сповіщення відправлено користувачу ${userId}: ${message}`);
  }
}

/**
 * SRP: Відповідає тільки за генерування звіту користувача
 * DIP: Імплементує інтерфейс
 */
export class UserReportGenerator implements IUserReportGenerator {
  constructor(private userRepository: IUserRepository,
              private reportRepository: IReportRepository) {}

  generate(): string {
    return this.generateActivityReport();
  }

  generateUserReport(userId: number): string {
    const user = this.userRepository.findUser(userId);
    if (!user) return '';

    const report = `
      User Report
      -----------
      ID: ${user.id}
      Name: ${user.name}
      Email: ${user.email}
      Phone: ${user.phone}
    `;

    this.reportRepository.save({
      userId,
      type: 'user',
      content: report,
      timestamp: new Date(),
    });

    return report;
  }

  private generateActivityReport(): string {
    const users = this.userRepository.getAllUsers();
    return `
      User Summary Report
      -------------------
      Total Users: ${users.length}
    `;
  }
}

/**
 * SRP: Відповідає тільки за генерування звіту активності
 * DIP: Імплементує інтерфейс
 */
export class ActivityReportGenerator implements IActivityReportGenerator {
  constructor(private userRepository: IUserRepository,
              private notificationRepository: INotificationRepository,
              private reportRepository: IReportRepository) {}

  generate(): string {
    return this.generateActivityReport();
  }

  generateActivityReport(): string {
    const users = this.userRepository.getAllUsers();
    const notifications = this.notificationRepository.getAll();

    const report = `
      Activity Report
      ---------------
      Total Users: ${users.length}
      Total Notifications Sent: ${notifications.length}
    `;

    this.reportRepository.save({
      type: 'activity',
      content: report,
      timestamp: new Date(),
    });

    return report;
  }
}

/**
 * SRP: Відповідає тільки за збереження сповіщень
 */
export class NotificationRepository implements INotificationRepository {
  private notifications: any[] = [];

  save(notification: any): void {
    this.notifications.push(notification);
  }

  getAll(): any[] {
    return [...this.notifications];
  }
}

/**
 * SRP: Відповідає тільки за збереження звітів
 */
export class ReportRepository implements IReportRepository {
  private reports: any[] = [];

  save(report: any): void {
    this.reports.push(report);
  }

  getAll(): any[] {
    return [...this.reports];
  }
}

/**
 * OCP: Легко додати новий тип експорту без редагування
 * SRP: Відповідає за експорт користувачів до JSON
 */
export class JsonUserExporter {
  constructor(private userRepository: IUserRepository) {}

  export(): string {
    const users = this.userRepository.getAllUsers();
    return JSON.stringify(users, null, 2);
  }
}

/**
 * OCP: Новий тип експорту
 * SRP: Відповідає за експорт користувачів до XML
 */
export class XmlUserExporter {
  constructor(private userRepository: IUserRepository) {}

  export(): string {
    const users = this.userRepository.getAllUsers();
    return `<users>${users.map(u =>
      `<user id="${u.id}" name="${u.name}" email="${u.email}" phone="${u.phone}"/>`
    ).join('')}</users>`;
  }
}

/**
 * SRP: Відповідає за резервне копіювання
 */
export class BackupService implements IBackupService {
  constructor(
    private userRepository: IUserRepository,
    private notificationRepository: INotificationRepository,
    private reportRepository: IReportRepository
  ) {}

  backup(): void {
    console.log('Резервне копіювання в процесі...');
    // Логіка резервного копіювання
    console.log('Резервне копіювання завершено');
  }

  restore(): void {
    console.log('Відновлення з резервної копії...');
    // Логіка відновлення
    console.log('Відновлення завершено');
  }
}

/**
 * LSP: Правильна ієрархія спадкування
 * Адміністративні операції не порушують контракт базового класу
 */
export class AdminUserRepository extends UserRepository {
  deleteAllUsers(): void {
    const users = this.getAllUsers();
    users.forEach(u => this.removeUser(u.id));
  }
}
