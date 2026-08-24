import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserFollowsTable1787554889517 implements MigrationInterface {
  name = 'CreateUserFollowsTable1787554889517';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_follows\` (\`followerId\` int NOT NULL, \`followingId\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_7c6c27f12c4e972eab4b3aaccb\` (\`followingId\`), PRIMARY KEY (\`followerId\`, \`followingId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_follows\` ADD CONSTRAINT \`FK_6300484b604263eaae8a6aab88d\` FOREIGN KEY (\`followerId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_follows\` ADD CONSTRAINT \`FK_7c6c27f12c4e972eab4b3aaccbf\` FOREIGN KEY (\`followingId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_follows\` DROP FOREIGN KEY \`FK_7c6c27f12c4e972eab4b3aaccbf\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_follows\` DROP FOREIGN KEY \`FK_6300484b604263eaae8a6aab88d\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_7c6c27f12c4e972eab4b3aaccb\` ON \`user_follows\``,
    );
    await queryRunner.query(`DROP TABLE \`user_follows\``);
  }
}
