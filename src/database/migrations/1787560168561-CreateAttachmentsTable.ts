import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttachmentsTable1787560168561 implements MigrationInterface {
  name = 'CreateAttachmentsTable1787560168561';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`attachments\` (\`id\` varchar(36) NOT NULL, \`attachableType\` varchar(50) NOT NULL, \`attachableId\` int NOT NULL, \`path\` varchar(500) NOT NULL, \`fileName\` varchar(255) NOT NULL, \`fileType\` varchar(100) NOT NULL, \`fileSize\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_9a92db6a1aba51ef2ff35e13fa\` (\`attachableType\`, \`attachableId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_9a92db6a1aba51ef2ff35e13fa\` ON \`attachments\``,
    );
    await queryRunner.query(`DROP TABLE \`attachments\``);
  }
}
