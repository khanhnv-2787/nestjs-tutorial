import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArticlesTables1787647430063 implements MigrationInterface {
    name = 'CreateArticlesTables1787647430063'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tags\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, UNIQUE INDEX \`IDX_d90243459a697eadb8ad56e909\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`articles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`slug\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(500) NOT NULL, \`body\` text NOT NULL, \`authorId\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_59ef48cb90fe79792157a78411\` (\`createdAt\`), UNIQUE INDEX \`IDX_1123ff6815c5b8fec0ba9fec37\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`article_favorites\` (\`userId\` int NOT NULL, \`articleId\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_e2ca248e177bef642adcdb65a6\` (\`articleId\`), PRIMARY KEY (\`userId\`, \`articleId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`article_tags\` (\`articleId\` int NOT NULL, \`tagId\` int NOT NULL, INDEX \`IDX_acbc7f775fb5e3fe2627477b5f\` (\`articleId\`), INDEX \`IDX_83a0534713c9e7f6bb2110c7bc\` (\`tagId\`), PRIMARY KEY (\`articleId\`, \`tagId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`articles\` ADD CONSTRAINT \`FK_65d9ccc1b02f4d904e90bd76a34\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`article_favorites\` ADD CONSTRAINT \`FK_c7cd65fc74f170833d3d9c81c3a\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`article_favorites\` ADD CONSTRAINT \`FK_e2ca248e177bef642adcdb65a65\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`article_tags\` ADD CONSTRAINT \`FK_acbc7f775fb5e3fe2627477b5f7\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`article_tags\` ADD CONSTRAINT \`FK_83a0534713c9e7f6bb2110c7bcc\` FOREIGN KEY (\`tagId\`) REFERENCES \`tags\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article_tags\` DROP FOREIGN KEY \`FK_83a0534713c9e7f6bb2110c7bcc\``);
        await queryRunner.query(`ALTER TABLE \`article_tags\` DROP FOREIGN KEY \`FK_acbc7f775fb5e3fe2627477b5f7\``);
        await queryRunner.query(`ALTER TABLE \`article_favorites\` DROP FOREIGN KEY \`FK_e2ca248e177bef642adcdb65a65\``);
        await queryRunner.query(`ALTER TABLE \`article_favorites\` DROP FOREIGN KEY \`FK_c7cd65fc74f170833d3d9c81c3a\``);
        await queryRunner.query(`ALTER TABLE \`articles\` DROP FOREIGN KEY \`FK_65d9ccc1b02f4d904e90bd76a34\``);
        await queryRunner.query(`DROP INDEX \`IDX_83a0534713c9e7f6bb2110c7bc\` ON \`article_tags\``);
        await queryRunner.query(`DROP INDEX \`IDX_acbc7f775fb5e3fe2627477b5f\` ON \`article_tags\``);
        await queryRunner.query(`DROP TABLE \`article_tags\``);
        await queryRunner.query(`DROP INDEX \`IDX_e2ca248e177bef642adcdb65a6\` ON \`article_favorites\``);
        await queryRunner.query(`DROP TABLE \`article_favorites\``);
        await queryRunner.query(`DROP INDEX \`IDX_1123ff6815c5b8fec0ba9fec37\` ON \`articles\``);
        await queryRunner.query(`DROP INDEX \`IDX_59ef48cb90fe79792157a78411\` ON \`articles\``);
        await queryRunner.query(`DROP TABLE \`articles\``);
        await queryRunner.query(`DROP INDEX \`IDX_d90243459a697eadb8ad56e909\` ON \`tags\``);
        await queryRunner.query(`DROP TABLE \`tags\``);
    }

}
