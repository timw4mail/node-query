-- sample data to test MySQL

--
-- Table structure for table `create_join`
--
DROP TABLE IF EXISTS `create_join` CASCADE;
CREATE TABLE IF NOT EXISTS `create_join` (
  `id` int(10) PRIMARY KEY NOT NULL,
  `key` VARCHAR(128),
  `val` MEDIUMTEXT
);

--
-- Table structure for table `create_test`
--
DROP TABLE IF EXISTS `create_test` CASCADE;
CREATE TABLE `create_test` (
  `id` int(10) NOT NULL,
  `key` TEXT,
  `val` LONGTEXT
);
ALTER TABLE `create_test`
 ADD PRIMARY KEY (`id`)
