<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261104164656 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE categoria ADD nombre VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE producto ADD nombre VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE producto ADD precio NUMERIC(10, 2) NOT NULL');
        $this->addSql('ALTER TABLE producto ADD descripcion TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE producto ADD categoria_id INT NOT NULL');
        $this->addSql('ALTER TABLE producto ADD CONSTRAINT FK_A7BB06153397707A FOREIGN KEY (categoria_id) REFERENCES categoria (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_A7BB06153397707A ON producto (categoria_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE categoria DROP nombre');
        $this->addSql('ALTER TABLE producto DROP CONSTRAINT FK_A7BB06153397707A');
        $this->addSql('DROP INDEX IDX_A7BB06153397707A');
        $this->addSql('ALTER TABLE producto DROP nombre');
        $this->addSql('ALTER TABLE producto DROP precio');
        $this->addSql('ALTER TABLE producto DROP descripcion');
        $this->addSql('ALTER TABLE producto DROP categoria_id');
    }
}
