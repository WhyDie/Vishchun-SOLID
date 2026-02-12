/**
 * АНТИ-SOLID КОД
 * Порушує всі 5 SOLID принципів
 */

// ❌ SRP VIOLATION: Один клас відповідає за всі операції
// ❌ OCP VIOLATION: Потрібно редагувати клас для додання нових типів звітів/сповіщень
// ❌ DIP VIOLATION: Залежність від конкретних класів замість абстракцій
// ❌ ISP VIOLATION: Клієнти залежать від методів, які вони не використовують
// ❌ LSP VIOLATION: Порушення контракту спадкування

export class UserManager {
  private users: any[] = [];
  private emailNotifications: any[] = [];
  private smsNotifications: any[] = [];
  private reports: any[] = [];

  // SRP VIOLATION: Всі операції в одному класі
  addUser(id: number, name: string, email: string, phone: string): void {
    const user = { id, name, email, phone };
    this.users.push(user);
  }

  removeUser(id: number): void {
    this.users = this.users.filter(u => u.id !== id);
  }

  findUser(id: number): any {
    return this.users.find(u => u.id === id);
  }

  // OCP VIOLATION: Для нового типу сповіщення потрібно редагувати цей клас
  notifyUserByEmail(userId: number, message: string): void {
    const user = this.findUser(userId);
    if (user) {
      this.emailNotifications.push({
        userId,
        email: user.email,
        message,
        timestamp: new Date(),
      });
      console.log(`Email відправлено до ${user.email}: ${message}`);
    }
  }

  notifyUserBySms(userId: number, message: string): void {
    const user = this.findUser(userId);
    if (user) {
      this.smsNotifications.push({
        userId,
        phone: user.phone,
        message,
        timestamp: new Date(),
      });
      console.log(`SMS відправлено до ${user.phone}: ${message}`);
    }
  }

  // OCP VIOLATION: Для нового типу звіту потрібно додавати нові методи
  generateUserReport(userId: number): string {
    const user = this.findUser(userId);
    if (!user) return '';

    const report = `
      User Report
      -----------
      ID: ${user.id}
      Name: ${user.name}
      Email: ${user.email}
      Phone: ${user.phone}
      Reports Count: ${this.reports.length}
    `;

    this.reports.push({
      userId,
      type: 'user',
      content: report,
      timestamp: new Date(),
    });

    return report;
  }

  generateActivityReport(): string {
    const report = `
      Activity Report
      ---------------
      Total Users: ${this.users.length}
      Total Emails Sent: ${this.emailNotifications.length}
      Total SMS Sent: ${this.smsNotifications.length}
    `;

    this.reports.push({
      type: 'activity',
      content: report,
      timestamp: new Date(),
    });

    return report;
  }

  // ISP VIOLATION: Методи, які деякі клієнти можуть не використовувати
  exportUsersToXml(): string {
    return `<users>${JSON.stringify(this.users)}</users>`;
  }

  exportUsersToJson(): string {
    return JSON.stringify(this.users);
  }

  exportReportsToXml(): string {
    return `<reports>${JSON.stringify(this.reports)}</reports>`;
  }

  exportReportsToJson(): string {
    return JSON.stringify(this.reports);
  }

  backupToCloud(): void {
    console.log('Backing up to cloud...');
    // Деякі клієнти можуть не потребувати цієї функціональності
  }

  restoreFromCloud(): void {
    console.log('Restoring from cloud...');
  }

  // Методи для отримання приватних даних
  getAllNotifications(): any[] {
    return [...this.emailNotifications, ...this.smsNotifications];
  }

  getAllReports(): any[] {
    return this.reports;
  }

  getAllUsers(): any[] {
    return this.users;
  }
}

// ❌ LSP VIOLATION: Дочірній клас порушує контракт батьківського
export class AdminUserManager extends UserManager {
  // LSP: Цей метод змінює поведінку та порушує очікування базового класу
  addUser(id: number, name: string, email: string, phone: string, role: string = 'admin'): void {
    if (role !== 'admin') {
      throw new Error('AdminUserManager може додавати тільки адміністраторів');
    }
    super.addUser(id, name, email, phone);
  }

  // Додаткові методи, доступні тільки для адмін версії
  deleteAllUsers(): void {
    const users = this.getAllUsers();
    users.forEach(u => this.removeUser(u.id));
  }

  // Порушення ISP: Адміністратор має доступ до усіх методів
  executeBackup(): void {
    this.backupToCloud();
  }
}
