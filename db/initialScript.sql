-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema propozal
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `propozal` ;

-- -----------------------------------------------------
-- Schema propozal
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `propozal` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `propozal` ;

-- -----------------------------------------------------
-- Table `propozal`.`role`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `propozal`.`role` ;

CREATE TABLE IF NOT EXISTS `propozal`.`role` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `propozal`.`user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `propozal`.`user` ;

CREATE TABLE IF NOT EXISTS `propozal`.`user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NULL,
  `email` VARCHAR(45) NOT NULL,
  `phone` VARCHAR(45) NOT NULL,
  `password` VARCHAR(120) NOT NULL,
  `public_key` VARCHAR(120) NOT NULL,
  `secret_key` VARCHAR(200) NOT NULL,
  `access_time` DATETIME NOT NULL,
  `created_time` DATETIME NULL,
  `updated_time` DATETIME NULL,
  `is_active` TINYINT(1) NULL DEFAULT 1,
  `role_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC),
  UNIQUE INDEX `phone_UNIQUE` (`phone` ASC),
  INDEX `fk_user_role1_idx` (`role_id` ASC),
  CONSTRAINT `fk_user_role1`
    FOREIGN KEY (`role_id`)
    REFERENCES `propozal`.`role` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
