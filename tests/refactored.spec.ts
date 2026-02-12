/**
 * UNIT ТЕСТИ ДЛЯ РЕФАКТОРОВАНОГО КОДУ
 */

import {
  UserRepository,
  EmailNotificationSender,
  SmsNotificationSender,
  UserReportGenerator,
  ActivityReportGenerator,
  NotificationRepository,
  ReportRepository,
  JsonUserExporter,
  XmlUserExporter,
  BackupService,
  AdminUserRepository,
} from '../src/refactored/index';

describe('SOLID Принципи - Рефакторований код', () => {
  describe('SRP - Single Responsibility Principle', () => {
    test('UserRepository відповідає тільки за управління користувачами', () => {
      const userRepository = new UserRepository();

      userRepository.addUser({ id: 1, name: 'John', email: 'john@test.com', phone: '123456' });
      userRepository.addUser({ id: 2, name: 'Jane', email: 'jane@test.com', phone: '654321' });

      expect(userRepository.getAllUsers().length).toBe(2);
      expect(userRepository.findUser(1)?.name).toBe('John');

      userRepository.removeUser(1);
      expect(userRepository.getAllUsers().length).toBe(1);
    });

    test('NotificationRepository відповідає тільки за збереження сповіщень', () => {
      const notificationRepository = new NotificationRepository();

      notificationRepository.save({ type: 'email', to: 'test@test.com', message: 'Hello' });
      notificationRepository.save({ type: 'sms', to: '+123456', message: 'Hi' });

      expect(notificationRepository.getAll().length).toBe(2);
    });

    test('ReportRepository відповідає тільки за збереження звітів', () => {
      const reportRepository = new ReportRepository();

      reportRepository.save({ type: 'user', userId: 1, content: 'Report1' });
      reportRepository.save({ type: 'activity', content: 'Report2' });

      expect(reportRepository.getAll().length).toBe(2);
    });
  });

  describe('OCP - Open/Closed Principle', () => {
    test('Можна додати новий тип експортера без редагування попередніх', () => {
      const userRepository = new UserRepository();
      userRepository.addUser({ id: 1, name: 'John', email: 'john@test.com', phone: '123456' });

      const jsonExporter = new JsonUserExporter(userRepository);
      const xmlExporter = new XmlUserExporter(userRepository);

      const jsonExport = jsonExporter.export();
      const xmlExport = xmlExporter.export();

      expect(jsonExport).toContain('John');
      expect(xmlExport).toContain('<user');
    });

    test('Можна додати новий тип сповіщень без редагування EmailNotificationSender', () => {
      const userRepository = new UserRepository();
      const notificationRepository = new NotificationRepository();

      userRepository.addUser({ id: 1, name: 'John', email: 'john@test.com', phone: '123456' });

      const emailSender = new EmailNotificationSender(userRepository, notificationRepository);
      const smsSender = new SmsNotificationSender(userRepository, notificationRepository);

      emailSender.send(1, 'Hello via Email');
      smsSender.send(1, 'Hello via SMS');

      expect(notificationRepository.getAll().length).toBe(2);
    });
  });

  describe('LSP - Liskov Substitution Principle', () => {
    test('AdminUserRepository правильно розширює UserRepository', () => {
      const adminRepository = new AdminUserRepository();

      adminRepository.addUser({ id: 1, name: 'Admin1', email: 'admin1@test.com', phone: '123456' });
      adminRepository.addUser({ id: 2, name: 'Admin2', email: 'admin2@test.com', phone: '654321' });

      // Всі методи базового класу працюють
      expect(adminRepository.getAllUsers().length).toBe(2);
      expect(adminRepository.findUser(1)?.name).toBe('Admin1');

      // Нені адміністративних операцій
      adminRepository.deleteAllUsers();
      expect(adminRepository.getAllUsers().length).toBe(0);
    });

    test('Наслідник не порушує контракт батька', () => {
      const baseRepository = new UserRepository();
      const adminRepository = new AdminUserRepository();

      const testRepository = (repo: UserRepository) => {
        repo.addUser({ id: 1, name: 'Test', email: 'test@test.com', phone: '123456' });
        expect(repo.getAllUsers().length).toBe(1);
        expect(repo.findUser(1)?.name).toBe('Test');
      };

      testRepository(baseRepository);
      testRepository(adminRepository);
    });
  });

  describe('ISP - Interface Segregation Principle', () => {
    test('Кожен клас імплементує тільки потрібні йому інтерфейси', () => {
      const userRepository = new UserRepository();
      const notificationRepository = new NotificationRepository();

      const emailSender = new EmailNotificationSender(userRepository, notificationRepository);
      const smsSender = new SmsNotificationSender(userRepository, notificationRepository);
      const userReportGen = new UserReportGenerator(userRepository, new ReportRepository());

      userRepository.addUser({ id: 1, name: 'John', email: 'john@test.com', phone: '123456' });

      // Кожен клас використовує тільки потрібні методи
      emailSender.send(1, 'Test');
      smsSender.send(1, 'Test');
      userReportGen.generateUserReport(1);

      expect(notificationRepository.getAll().length).toBe(2);
    });
  });

  describe('DIP - Dependency Inversion Principle', () => {
    test('Залежності передаються через інтерфейси, а не конкретні класи', () => {
      // Всі сервіси залежать від інтерфейсів, а не конкретних реалізацій
      const userRepository = new UserRepository();
      const notificationRepository = new NotificationRepository();
      const reportRepository = new ReportRepository();

      userRepository.addUser({ id: 1, name: 'John', email: 'john@test.com', phone: '123456' });

      // Компоненти залежать від абстракцій
      const emailSender = new EmailNotificationSender(userRepository, notificationRepository);
      const userReportGen = new UserReportGenerator(userRepository, reportRepository);
      const activityReportGen = new ActivityReportGenerator(
        userRepository,
        notificationRepository,
        reportRepository
      );

      emailSender.send(1, 'Test Email');
      userReportGen.generateUserReport(1);
      activityReportGen.generateActivityReport();

      expect(notificationRepository.getAll().length).toBe(1);
      expect(reportRepository.getAll().length).toBe(2);
    });

    test('Можна легко замінити реалізацію без зміни кліптів', () => {
      // Створюємо mock для тестування
      class MockUserRepository {
        addUser() {}
        removeUser() {}
        findUser(id: number) {
          return { id, name: 'Mock', email: 'mock@test.com', phone: '000' };
        }
        getAllUsers() {
          return [];
        }
      }

      const userRepository = new MockUserRepository() as any;
      const notificationRepository = new NotificationRepository();

      const emailSender = new EmailNotificationSender(userRepository, notificationRepository);
      emailSender.send(1, 'Test');

      expect(notificationRepository.getAll().length).toBe(1);
    });
  });

  describe('Інтеграційні тести', () => {
    test('Повний цикл: додавання користувача, відправлення сповіщень, генерування звітів', () => {
      const userRepository = new UserRepository();
      const notificationRepository = new NotificationRepository();
      const reportRepository = new ReportRepository();

      // Додаємо користувачів
      userRepository.addUser({ id: 1, name: 'John', email: 'john@test.com', phone: '+123456' });
      userRepository.addUser({ id: 2, name: 'Jane', email: 'jane@test.com', phone: '+654321' });

      // Відправляємо сповіщення
      const emailSender = new EmailNotificationSender(userRepository, notificationRepository);
      const smsSender = new SmsNotificationSender(userRepository, notificationRepository);

      emailSender.send(1, 'Welcome John');
      smsSender.send(2, 'Welcome Jane');

      // Генеруємо звіти
      const userReportGen = new UserReportGenerator(userRepository, reportRepository);
      const activityReportGen = new ActivityReportGenerator(
        userRepository,
        notificationRepository,
        reportRepository
      );

      userReportGen.generateUserReport(1);
      activityReportGen.generateActivityReport();

      // Перевіряємо результати
      expect(userRepository.getAllUsers().length).toBe(2);
      expect(notificationRepository.getAll().length).toBe(2);
      expect(reportRepository.getAll().length).toBe(2);

      // Експортуємо дані
      const jsonExporter = new JsonUserExporter(userRepository);
      const exported = jsonExporter.export();

      expect(exported).toContain('John');
      expect(exported).toContain('Jane');
    });

    test('Резервне копіювання та відновлення', () => {
      const userRepository = new UserRepository();
      const notificationRepository = new NotificationRepository();
      const reportRepository = new ReportRepository();
      const backupService = new BackupService(
        userRepository,
        notificationRepository,
        reportRepository
      );

      userRepository.addUser({ id: 1, name: 'John', email: 'john@test.com', phone: '+123456' });

      expect(() => {
        backupService.backup();
        backupService.restore();
      }).not.toThrow();
    });
  });
});
