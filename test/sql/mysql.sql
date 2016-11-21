-- sample data to test MySQL

--
-- Table structure for table `create_join`
--

DROP TABLE IF EXISTS `create_join` CASCADE;
CREATE TABLE `create_join` (
  `id` int(10) NOT NULL,
  `key` text,
  `val` text
);
ALTER TABLE `create_join`
 ADD PRIMARY KEY (`id`);

--
-- Table structure for table `create_test`
--

DROP TABLE IF EXISTS `create_test` CASCADE;
CREATE TABLE `create_test` (
  `id` int(10) NOT NULL,
  `key` text,
  `val` text
);
ALTER TABLE `create_test`
 ADD PRIMARY KEY (`id`);