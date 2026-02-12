/**
 * ІНТЕРФЕЙСИ ДЛЯ РЕФАКТОРИНГУ
 * DIP: Залежності реалізовані через абстракції
 * ISP: Невеликі й специфічні інтерфейси
 */

/**
 * User Domain Models
 */
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

/**
 * SRP & DIP: Окремий інтерфейс для управління користувачами
 */
export interface IUserRepository {
  addUser(user: User): void;
  removeUser(id: number): void;
  findUser(id: number): User | undefined;
  getAllUsers(): User[];
}

/**
 * SRP & DIP: Окремий інтерфейс для відправлення сповіщень
 * ISP: Мінімальний інтерфейс для відправлення конкретного типу сповіщення
 */
export interface INotificationSender {
  send(userId: number, message: string): void;
}

/**
 * ISP: Окремі інтерфейси для різних типів сповіщень
 */
export interface IEmailNotificationSender extends INotificationSender {
  sendEmail(email: string, message: string): void;
}

export interface ISmsNotificationSender extends INotificationSender {
  sendSms(phone: string, message: string): void;
}

/**
 * SRP & DIP: Окремий інтерфейс для генерування звітів
 * ISP: Мінімальний інтерфейс
 */
export interface IReportGenerator {
  generate(): string;
}

/**
 * ISP: Окремі інтерфейси для різних типів звітів
 */
export interface IUserReportGenerator extends IReportGenerator {
  generateUserReport(userId: number): string;
}

export interface IActivityReportGenerator extends IReportGenerator {
  generateActivityReport(): string;
}

/**
 * SRP & DIP: Окремий інтерфейс для експорту
 * ISP: Мінімальний інтерфейс
 */
export interface IExporter {
  export(): string;
}

/**
 * SRP & DIP: Окремий інтерфейс для резервного копіювання
 */
export interface IBackupService {
  backup(): void;
  restore(): void;
}

/**
 * Сховище сповіщень (для логування)
 */
export interface INotificationRepository {
  save(notification: any): void;
  getAll(): any[];
}

/**
 * Сховище звітів (для логування)
 */
export interface IReportRepository {
  save(report: any): void;
  getAll(): any[];
}
