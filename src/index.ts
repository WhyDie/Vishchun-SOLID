/**
 * Демонстрація SOLID принципів
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
  BackupService,
} from './refactored/index';

console.log('=== SOLID Принципи в TypeScript ===\n');

// Ініціалізуємо репозиторії та сервіси
const userRepository = new UserRepository();
const notificationRepository = new NotificationRepository();
const reportRepository = new ReportRepository();

// Додаємо користувачів
console.log('1. Додавання користувачів:');
userRepository.addUser({ id: 1, name: 'Іван Петренко', email: 'ivan@example.com', phone: '+380501234567' });
userRepository.addUser({ id: 2, name: 'Марія Сидоренко', email: 'maria@example.com', phone: '+380509876543' });
userRepository.addUser({ id: 3, name: 'Петро Коваленко', email: 'petro@example.com', phone: '+380503332211' });
console.log(`Додано ${userRepository.getAllUsers().length} користувачів\n`);

// Відправляємо сповіщення (SRP: кожен клас має одну відповідальність)
console.log('2. Відправлення сповіщень:');
const emailSender = new EmailNotificationSender(userRepository, notificationRepository);
const smsSender = new SmsNotificationSender(userRepository, notificationRepository);

emailSender.send(1, 'Ласкаво просимо до системи!');
emailSender.send(2, 'Ваш профіль активовано');
smsSender.send(3, 'Важливе повідомлення: оновлення системи');
console.log(`Відправлено ${notificationRepository.getAll().length} сповіщень\n`);

// Генеруємо звіти (DIP: залежності від інтерфейсів)
console.log('3. Генерування звітів:');
const userReportGen = new UserReportGenerator(userRepository, reportRepository);
const activityReportGen = new ActivityReportGenerator(userRepository, notificationRepository, reportRepository);

console.log(userReportGen.generateUserReport(1));
console.log(activityReportGen.generateActivityReport());

// Експортуємо дані (OCP: можна додати нові експортери без змін)
console.log('\n4. Експорт даних до JSON:');
const jsonExporter = new JsonUserExporter(userRepository);
console.log(jsonExporter.export());

// Резервне копіювання (SRP: окремий клас для резервного копіювання)
console.log('\n5. Резервне копіювання:');
const backupService = new BackupService(userRepository, notificationRepository, reportRepository);
backupService.backup();
backupService.restore();

console.log('\n=== Демонстрація завершена ===');
