--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Debian 16.9-1.pgdg120+1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Location; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Location" (id, name, status, "createdAt", "updatedAt") FROM stdin;
cmbkufomo0003680tr7qxxejw	Berlin Office	ACTIVE	2025-06-06 13:30:59.569	2025-06-06 13:30:59.569
cmbkufomt0004680tx8c7wjrw	Hamburg Office	ACTIVE	2025-06-06 13:30:59.573	2025-06-06 13:30:59.573
cmbkufomw0005680typj69ozu	Social Media	ACTIVE	2025-06-06 13:30:59.576	2025-06-06 13:30:59.576
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, name, role, "createdAt", "updatedAt") FROM stdin;
cmbkufokv0001680tkeor7ce5	user@example.com	$2a$10$LIio5s1iv.L.lyW87Aezp.FWwcwsFOX3xCYP9UiCpUu3WnrokDcvG	Test User	USER	2025-06-06 13:30:59.503	2025-06-06 13:30:59.503
cmbkufomk0002680t53b5dske	demo@example.com	$2a$10$BPIMvrqDKaPj4yS3eFKxmuwkZReXVmOvSK.RUGNM8ymdkLFsUlxNe	Demo User	USER	2025-06-06 13:30:59.565	2025-06-06 13:30:59.565
cmbkufojh0000680ty85x3bu6	admin@example.com	$2a$10$DJk03IntjCaiqCn3QTCGJuTFI8UNTvnGiQ/w9/620ziMlnwRo9l6i	Admin User	ADMIN	2025-06-06 13:30:59.453	2025-06-06 13:31:47.025
\.


--
-- Data for Name: ContentPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ContentPlan" (id, monat, bezug, mehrwert, "mechanikThema", idee, platzierung, status, "locationId", "createdById", "updatedById", "createdAt", "updatedAt") FROM stdin;
cmbkugpdi000xsmqzkj7xne6p	März	Vielfalt	Frühjahrsputz und Organisation	Blog-Serie	5-teilige Serie: Ordnung schaffen mit System	Facebook	IN_PROGRESS	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.191	2025-06-06 13:45:03.14
cmbkugpdb000tsmqzmqscakwd	Januar	Vielfalt	Neujahrsvorsätze und gesunde Ernährung	Social Media Kampagne	10 Tipps für einen gesunden Start ins neue Jahr	FB + IG	APPROVED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.184	2025-06-06 13:45:30.577
cmbkugpdl000zsmqzjgtlloqr	Februar	Vielfalt	Familienzeit und Traditionen	DIY-Anleitung	Osterdeko selbst gemacht - 3 einfache Ideen	FB + IG	DRAFT	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.194	2025-06-06 13:58:51.441
cmbkugpdf000vsmqzio900z9z	Februar	Vielfalt	Romantische Geschenkideen	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Facebook	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.188	2025-06-06 14:11:50.689
\.


--
-- Data for Name: InputPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InputPlan" (id, "contentPlanId", monat, bezug, mehrwert, "mechanikThema", idee, platzierung, status, voe, zusatzinfo, "gptResult", "locationId", "createdById", "updatedById", "createdAt", "updatedAt") FROM stdin;
cmbkugpdo0011smqzcmkf1cgx	cmbkugpdb000tsmqzmqscakwd	2025-01	Neujahr	Neujahrsvorsätze und gesunde Ernährung	Social Media Kampagne	10 Tipps für einen gesunden Start ins neue Jahr	Instagram, Facebook	COMPLETED	2025-01-02 00:00:00	Fokus auf praktische, umsetzbare Tipps. Zielgruppe: 25-45 Jahre	\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.197	2025-06-06 13:31:47.197
cmbkvfkts0001ovh65i3wpvxv	cmbkugpdl000zsmqzjgtlloqr	Februar	Vielfalt	Familienzeit und Traditionen	DIY-Anleitung	Osterdeko selbst gemacht - 3 einfache Ideen	FB + IG	DRAFT	\N		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-06 13:58:54.257	2025-06-06 13:58:54.257
cmbkvw7w10003ovh60g5wr0h6	cmbkugpdf000vsmqzio900z9z	Februar	Vielfalt	Romantische Geschenkideen	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Facebook	REVIEW	\N		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-06 14:11:50.641	2025-06-06 14:31:49.584
cmbkugpdt0013smqzlnpgr5kt	cmbkugpdf000vsmqzio900z9z	2025-02	Valentinstag	Romantische Geschenkideen	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	COMPLETED	2025-02-07 00:00:00	Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.	\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-06 13:31:47.202	2025-06-06 14:40:44.823
\.


--
-- Data for Name: UserLocation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserLocation" (id, "userId", "locationId") FROM stdin;
cmbkufon00007680t6jnn4fap	cmbkufojh0000680ty85x3bu6	cmbkufomo0003680tr7qxxejw
cmbkugpcv000nsmqz4a1xzyje	cmbkufokv0001680tkeor7ce5	cmbkufomo0003680tr7qxxejw
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Permission" (id, name, "userLocationId") FROM stdin;
cmbkugpcd000dsmqz7icxk2xb	manage_all	cmbkufon00007680t6jnn4fap
cmbkugpci000fsmqza4n5916v	create_content	cmbkufon00007680t6jnn4fap
cmbkugpcl000hsmqz8ihppp3t	edit_content	cmbkufon00007680t6jnn4fap
cmbkugpco000jsmqzuu5oiply	delete_content	cmbkufon00007680t6jnn4fap
cmbkugpcr000lsmqzlixo25gu	publish_content	cmbkufon00007680t6jnn4fap
cmbkugpd2000rsmqzvu6gmcqx	view_content	cmbkugpcv000nsmqz4a1xzyje
\.


--
-- Data for Name: RedakPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RedakPlan" (id, "inputPlanId", monat, bezug, "mechanikThema", idee, platzierung, voe, status, publiziert, "locationId", "createdById", "updatedById", "createdAt", "updatedAt") FROM stdin;
cmbkugpdw0015smqzpx6chtx8	cmbkugpdo0011smqzcmkf1cgx	2025-01	Neujahr	Social Media Kampagne	10 Tipps für einen gesunden Start ins neue Jahr	Instagram, Facebook	2025-01-02 00:00:00	COMPLETED	t	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.205	2025-06-06 13:31:47.205
cmbkwxdvm0007ovh67ouvf0uu	cmbkugpdt0013smqzlnpgr5kt	2025-02	Valentinstag	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-02-07 00:00:00	IN_PROGRESS	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 14:40:44.674	2025-06-06 14:40:44.674
\.


--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserRole" (id, name, description) FROM stdin;
cmbkugpbw0006smqze4rduroy	LOCATION_ADMIN	Administrator für einen Standort
cmbkugpc30007smqzfhc2e22a	LOCATION_USER	Normaler Benutzer für einen Standort
\.


--
-- Data for Name: UserLocationRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserLocationRole" (id, "userLocationId", "roleId") FROM stdin;
cmbkugpc9000bsmqziz76v9up	cmbkufon00007680t6jnn4fap	cmbkugpbw0006smqze4rduroy
cmbkugpcz000psmqzhprzrt17	cmbkugpcv000nsmqz4a1xzyje	cmbkugpc30007smqzfhc2e22a
\.


--
-- PostgreSQL database dump complete
--

