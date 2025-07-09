--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Debian 16.9-1.pgdg120+1)
-- Dumped by pg_dump version 16.9 (Debian 16.9-1.pgdg120+1)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ContentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ContentStatus" AS ENUM (
    'DRAFT',
    'IN_PROGRESS',
    'REVIEW',
    'APPROVED',
    'COMPLETED'
);


ALTER TYPE public."ContentStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ContentPlan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ContentPlan" (
    id text NOT NULL,
    monat text NOT NULL,
    bezug text NOT NULL,
    mehrwert text,
    "mechanikThema" text NOT NULL,
    idee text NOT NULL,
    platzierung text NOT NULL,
    status public."ContentStatus" DEFAULT 'DRAFT'::public."ContentStatus" NOT NULL,
    "locationId" text NOT NULL,
    "createdById" text NOT NULL,
    "updatedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    action text,
    "copyExample" text,
    "copyExampleCustomized" text,
    "creativeBriefingExample" text,
    "creativeFormat" text,
    "firstCommentForEngagement" text,
    "implementationLevel" text,
    notes text,
    "statusChangedAt" timestamp(3) without time zone,
    "statusChangedById" text
);


ALTER TABLE public."ContentPlan" OWNER TO postgres;

--
-- Name: ContentPlanHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ContentPlanHistory" (
    id text NOT NULL,
    "contentPlanId" text NOT NULL,
    action text NOT NULL,
    "fieldName" text,
    "oldValue" text,
    "newValue" text,
    "changedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedById" text NOT NULL,
    metadata jsonb
);


ALTER TABLE public."ContentPlanHistory" OWNER TO postgres;

--
-- Name: InputPlan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InputPlan" (
    id text NOT NULL,
    "contentPlanId" text,
    monat text NOT NULL,
    bezug text NOT NULL,
    mehrwert text,
    "mechanikThema" text NOT NULL,
    idee text NOT NULL,
    platzierung text NOT NULL,
    status public."ContentStatus" DEFAULT 'DRAFT'::public."ContentStatus" NOT NULL,
    voe timestamp(3) without time zone,
    zusatzinfo text,
    "gptResult" text,
    "locationId" text NOT NULL,
    "createdById" text,
    "updatedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    notes text,
    action text,
    flag boolean DEFAULT false NOT NULL,
    "implementationLevel" text,
    "creativeFormat" text,
    "creativeBriefingExample" text,
    "copyExample" text,
    "copyExampleCustomized" text,
    "firstCommentForEngagement" text,
    "n8nResult" text,
    "voeDate" timestamp(3) without time zone,
    "deletedAt" timestamp(3) without time zone,
    "deletedById" text
);


ALTER TABLE public."InputPlan" OWNER TO postgres;

--
-- Name: InputPlanHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InputPlanHistory" (
    id text NOT NULL,
    "inputPlanId" text NOT NULL,
    field text,
    "oldValue" text,
    "newValue" text,
    "changedById" text NOT NULL,
    "changedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    action text DEFAULT 'UPDATE'::text NOT NULL,
    "changedBy" text DEFAULT 'System'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "newData" jsonb,
    "previousData" jsonb
);


ALTER TABLE public."InputPlanHistory" OWNER TO postgres;

--
-- Name: Location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Location" (
    id text NOT NULL,
    name text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Location" OWNER TO postgres;

--
-- Name: Permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Permission" (
    id text NOT NULL,
    name text NOT NULL,
    "userLocationId" text NOT NULL,
    description text
);


ALTER TABLE public."Permission" OWNER TO postgres;

--
-- Name: RedakPlan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RedakPlan" (
    id text NOT NULL,
    "inputPlanId" text,
    monat text NOT NULL,
    bezug text NOT NULL,
    "mechanikThema" text NOT NULL,
    idee text NOT NULL,
    platzierung text NOT NULL,
    voe timestamp(3) without time zone NOT NULL,
    status public."ContentStatus" DEFAULT 'DRAFT'::public."ContentStatus" NOT NULL,
    publiziert boolean DEFAULT false NOT NULL,
    "locationId" text NOT NULL,
    "createdById" text,
    "updatedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RedakPlan" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text,
    role text DEFAULT 'USER'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserLocation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserLocation" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "locationId" text NOT NULL
);


ALTER TABLE public."UserLocation" OWNER TO postgres;

--
-- Name: UserLocationRole; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserLocationRole" (
    id text NOT NULL,
    "userLocationId" text NOT NULL,
    "roleId" text NOT NULL
);


ALTER TABLE public."UserLocationRole" OWNER TO postgres;

--
-- Name: UserRole; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserRole" (
    id text NOT NULL,
    name text NOT NULL,
    description text
);


ALTER TABLE public."UserRole" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: ContentPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ContentPlan" (id, monat, bezug, mehrwert, "mechanikThema", idee, platzierung, status, "locationId", "createdById", "updatedById", "createdAt", "updatedAt", action, "copyExample", "copyExampleCustomized", "creativeBriefingExample", "creativeFormat", "firstCommentForEngagement", "implementationLevel", notes, "statusChangedAt", "statusChangedById") FROM stdin;
49b28e2f-dd37-4a3e-b359-fd2ff3aa0349	August	Event	Gesundheit am Arbeitsplatz	Sommerfitness	Bike-to-Work Challenge	FB + IG	IN_PROGRESS	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-07-05 14:20:46.234	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b19f85af-c471-45a6-a5f4-fcafbb679fb3	2024-05	Tag der Arbeit	Mitarbeiteranerkennung	Erfolgsgeschichten	Mitarbeiter des Monats Feature	Intranet + Social Media	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-10 06:08:31.071	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6a9635a0-d093-4435-8862-6fb7fecea0e8	Januar	Vielfalt	Wissensvermittlung	Weiterbildung	Summer School Programm	Instagram	COMPLETED	cmbkufomt0004680tx8c7wjrw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-11 04:18:54.481	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbkugpdl000zsmqzjgtlloqr	Februar	Vielfalt	Familienzeit und Traditionen	DIY-Anleitung	Osterdeko selbst gemacht - 3 einfache Ideen	FB + IG	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.194	2025-06-11 04:19:28.281	test	test	test	test	test	tst	EINFACH	test	\N	\N
cmbopksot000xpptr9j75qnz2	Juni	Saisonal	Frühjahrsputz und Organisation	Blog-Serie  2	5-teilige Serie: Ordnung schaffen mit System	TikTok + IG	COMPLETED	cmbkufomw0005680typj69ozu	cmbkufojh0000680ty85x3bu6	\N	2025-06-09 06:26:04.733	2025-06-10 15:18:51.902	test	test	test	test	test	test	MITTEL	Notizen Test	\N	\N
cmbkugpdf000vsmqzio900z9z	Februar	Vielfalt	Romantische Geschenkideen	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Facebook	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.188	2025-06-06 14:11:50.689	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbopksok000tpptr3d6c7svs	2025-01	Neujahr	Neujahrsvorsätze und gesunde Ernährung	Social Media Kampagne	10 Tipps für einen gesunden Start ins neue Jahr	Instagram, Facebook	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-09 06:26:04.724	2025-06-09 06:26:04.724	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbopksoq000vpptrp8synmy3	2025-02	Valentinstag	Romantische Geschenkideen	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-09 06:26:04.73	2025-06-11 04:43:56.244	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6b72b02b-7c25-42f7-aabc-c95708486259	2024-04	Ostern	Work-Life-Balance	Familienfreundlichkeit	Oster-Event für Mitarbeiterkinder	Newsletter + Flyer	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-11 07:00:10.998	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbkugpdi000xsmqzkj7xne6p	März	Vielfalt	Frühjahrsputz und Organisation	Blog-Serie	5-teilige Serie: Ordnung schaffen mit System	Facebook	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.191	2025-06-11 07:12:14.56	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5a8b22f1-8d06-43c8-804d-9e1266088eff	Juni	Vielfalt	Motivation und Aufbruch	Nachhaltigkeit	Green Office Initiative	FB + IG	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-11 14:21:07.85	ete	rez	erz	ete	\N	erz	EINFACH	\N	\N	\N
cmbkugpdb000tsmqzmqscakwd	Juni	Vielfalt	Neujahrsvorsätze und gesunde Ernährung	Social Media Kampagne	10 Tipps für einen gesunden Start ins neue Jahr	FB + IG	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.184	2025-06-11 14:38:05.163	6587	56868	56868	587568	\N	868	\N	568	\N	\N
c3a27acb-fd41-4709-9347-e8de54a9429d	2024-01	Neujahr 2024	Gesundheitstipps für den Start	Neujahrsvorsätze	Fitness-Challenge für Mitarbeiter	Intranet + Newsletter	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-19 07:42:07.472	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbopksow000zpptr3shuqx0c	Februar	Saisonal	Familienzeit und Traditionen	DIY-Anleitung Test	Osterdeko selbst gemacht - 3 einfache Ideen	Instagram	COMPLETED	cmbkufomt0004680tx8c7wjrw	cmbkufojh0000680ty85x3bu6	\N	2025-06-09 06:26:04.736	2025-07-05 10:15:40.003	4757	6544575	ewfer	4646	\N	rgert	\N	erg	\N	\N
49f16a8c-778d-4a1e-8f32-f38588d2e7c6	März	Vielfalt	Erholung und Produktivität	Urlaubstipps	Vacation Sharing Platform	Instagram	APPROVED	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-07-05 14:32:44.76	\N	\N	\N	\N	\N	\N	EINFACH	\N	\N	\N
fd27e060-d07b-42b5-84f8-ee8f01d92077	Januar	Vielfalt	Teambuilding	Kreativität	Kostümwettbewerb im Büro	Facebook	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-07-05 14:07:52.538	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2a79279e-51fa-4f6e-a145-1713bb703520	August	Vielfalt	Innovation fördern	Ideenwettbewerb	Innovation Challenge 2024	Instagram	IN_PROGRESS	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-07-05 14:20:15.501	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
37248d57-3497-48f1-bcf6-35e59cafd3c4	September	Saisonal	Teamzusammenhalt stärken	Wertschätzung	Dankeschön-Aktion für Kollegen	Facebook	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-07-06 19:51:22.807	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmcq2eh520001pv7fsz8sv02x	Juli	Saisonal	abhängig von thematischer Ausführung	Summer Vibes  – Fokusthema	Wir spielen Sommer Memory mit den Besuchenden im Center.	Facebook	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-05 09:52:33.348	2025-07-05 11:12:13.762	\N	Hättest du die Preise richtig geraten? 👀 💸 	Erweiterung als Gewinnspiel möglich:\nWer den Preis richtig tippt, gewinnt einen Gutschein fürs Center! Sommer-Essentials shoppen und dabei abstauben – let’s go! 🕶️🩴	Reel:\nVon Mode über Accessoires bis hin zu coolen Reise-Gadgets zeigt der Creator, was das Center zubieten hat und stellt sich gleichzeitig der Guess the Price Challenge. Die Follower können ihren Tipp in den Kommentaren abgeben. Dabei liegt der Fokus auf Interaktion, Spaß und dem Entdecken aktueller Sommertrends. \nZiel: Aufmerksamkeit, Engagement und Shopping-Inspiration für die warme Jahreszeit.\n\nBeispiel: https://www.instagram.com/p/DHyKKpkitv0/	Video	Guter Vorschlag können wir so umsetzen	MITTEL	\N	2025-07-05 09:52:33.347	cmbkufojh0000680ty85x3bu6
\.


--
-- Data for Name: ContentPlanHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ContentPlanHistory" (id, "contentPlanId", action, "fieldName", "oldValue", "newValue", "changedAt", "changedById", metadata) FROM stdin;
cmbq3a9950000kp7h6ulrgebc	cmbopksow000zpptr3shuqx0c	STATUS_CHANGE	status	IN_PROGRESS	REVIEW	2025-06-10 05:37:33.785	cmbkufojh0000680ty85x3bu6	\N
cmbq3b4z10001kp7hbvagyf4f	cmbopksot000xpptr9j75qnz2	UPDATE	locationId	cmbkufomo0003680tr7qxxejw	cmbkufomt0004680tx8c7wjrw	2025-06-10 05:38:14.894	cmbkufojh0000680ty85x3bu6	\N
cmbq3g0i70002kp7h161u6lfc	cmbopksot000xpptr9j75qnz2	UPDATE	Standort	Hamburg Office	Berlin Office	2025-06-10 05:42:02.383	cmbkufojh0000680ty85x3bu6	\N
cmbq3g0i70003kp7hh9kepzis	cmbopksot000xpptr9j75qnz2	UPDATE	implementationLevel		EINFACH	2025-06-10 05:42:02.383	cmbkufojh0000680ty85x3bu6	\N
cmbq4ysku0000pluzannq8ckq	6a9635a0-d093-4435-8862-6fb7fecea0e8	UPDATE	monat	2024-08	Januar	2025-06-10 06:24:38.191	cmbkufojh0000680ty85x3bu6	\N
cmbq4ysku0001pluzsc429u9v	6a9635a0-d093-4435-8862-6fb7fecea0e8	UPDATE	bezug	Back to Work	Vielfalt	2025-06-10 06:24:38.191	cmbkufojh0000680ty85x3bu6	\N
cmbq4ysku0002pluzuzxmx4py	6a9635a0-d093-4435-8862-6fb7fecea0e8	UPDATE	platzierung	E-Mail + Webinar	Instagram	2025-06-10 06:24:38.191	cmbkufojh0000680ty85x3bu6	\N
cmbq4ysku0003pluzfj8kkrwr	6a9635a0-d093-4435-8862-6fb7fecea0e8	UPDATE	Standort	Berlin Office	Hamburg Office	2025-06-10 06:24:38.191	cmbkufojh0000680ty85x3bu6	\N
cmbqgmdov00005npc5ihd2nwy	cmbopksot000xpptr9j75qnz2	STATUS_CHANGE	status	IN_PROGRESS	REVIEW	2025-06-10 11:50:54.416	cmbkufojh0000680ty85x3bu6	\N
cmbqgmdov00015npcwuzzantd	cmbopksot000xpptr9j75qnz2	UPDATE	Standort	Berlin Office	Social Media	2025-06-10 11:50:54.416	cmbkufojh0000680ty85x3bu6	\N
cmbqgmw2300025npcqz5y83rd	cmbopksot000xpptr9j75qnz2	STATUS_CHANGE	status	REVIEW	APPROVED	2025-06-10 11:51:18.22	cmbkufojh0000680ty85x3bu6	\N
cmbqi3adl00035npc52ll9uso	cmbopksot000xpptr9j75qnz2	UPDATE	notes		Notizen Test	2025-06-10 12:32:02.89	cmbkufojh0000680ty85x3bu6	\N
cmbqjflkn0000yrfq6iib9d18	cmbopksot000xpptr9j75qnz2	UPDATE	implementationLevel	EINFACH	MITTEL	2025-06-10 13:09:36.887	cmbkufojh0000680ty85x3bu6	\N
cmbqjflkn0001yrfqp6didtm6	cmbopksot000xpptr9j75qnz2	UPDATE	creativeFormat		test	2025-06-10 13:09:36.887	cmbkufojh0000680ty85x3bu6	\N
cmbqjflkn0002yrfqe7leez1n	cmbopksot000xpptr9j75qnz2	UPDATE	creativeBriefingExample		test	2025-06-10 13:09:36.887	cmbkufojh0000680ty85x3bu6	\N
cmbqjflkn0003yrfqgvpdd0u7	cmbopksot000xpptr9j75qnz2	UPDATE	copyExample		test	2025-06-10 13:09:36.887	cmbkufojh0000680ty85x3bu6	\N
cmbqjflkn0004yrfqtftcgnlq	cmbopksot000xpptr9j75qnz2	UPDATE	copyExampleCustomized		test	2025-06-10 13:09:36.887	cmbkufojh0000680ty85x3bu6	\N
cmbqjflkn0005yrfq4wnnywsy	cmbopksot000xpptr9j75qnz2	UPDATE	firstCommentForEngagement		test	2025-06-10 13:09:36.887	cmbkufojh0000680ty85x3bu6	\N
cmbqjflkn0006yrfqtq9z035o	cmbopksot000xpptr9j75qnz2	UPDATE	action		test	2025-06-10 13:09:36.887	cmbkufojh0000680ty85x3bu6	\N
cmbqo1te30000tfvfpkizm853	cmbopksot000xpptr9j75qnz2	STATUS_CHANGE	status	APPROVED	COMPLETED	2025-06-10 15:18:51.916	cmbkufojh0000680ty85x3bu6	\N
cmbqo8rs90000eyg8xdyywzre	cmbkugpdl000zsmqzjgtlloqr	UPDATE	implementationLevel		EINFACH	2025-06-10 15:24:16.426	cmbkufojh0000680ty85x3bu6	\N
cmbqo8rs90001eyg8ioz480i2	cmbkugpdl000zsmqzjgtlloqr	UPDATE	creativeFormat		test	2025-06-10 15:24:16.426	cmbkufojh0000680ty85x3bu6	\N
cmbqo8rs90002eyg8803jfsk0	cmbkugpdl000zsmqzjgtlloqr	UPDATE	notes		test	2025-06-10 15:24:16.426	cmbkufojh0000680ty85x3bu6	\N
cmbqo8rs90003eyg808d36egv	cmbkugpdl000zsmqzjgtlloqr	UPDATE	creativeBriefingExample		test	2025-06-10 15:24:16.426	cmbkufojh0000680ty85x3bu6	\N
cmbqo8rs90004eyg8eqlqbcjj	cmbkugpdl000zsmqzjgtlloqr	UPDATE	copyExample		test	2025-06-10 15:24:16.426	cmbkufojh0000680ty85x3bu6	\N
cmbqo8rs90005eyg8puvx3yu4	cmbkugpdl000zsmqzjgtlloqr	UPDATE	copyExampleCustomized		test	2025-06-10 15:24:16.426	cmbkufojh0000680ty85x3bu6	\N
cmbqo8rs90006eyg86tw9oj8h	cmbkugpdl000zsmqzjgtlloqr	UPDATE	firstCommentForEngagement		tst	2025-06-10 15:24:16.426	cmbkufojh0000680ty85x3bu6	\N
cmbqo8rs90007eyg8phqgm6ud	cmbkugpdl000zsmqzjgtlloqr	UPDATE	action		test	2025-06-10 15:24:16.426	cmbkufojh0000680ty85x3bu6	\N
cmbrfwyhl0002oq3np8gw09wx	6a9635a0-d093-4435-8862-6fb7fecea0e8	STATUS_CHANGE	status	APPROVED	COMPLETED	2025-06-11 04:18:54.489	cmbkufojh0000680ty85x3bu6	\N
cmbrfxoke0005oq3n4pduhmwh	cmbkugpdl000zsmqzjgtlloqr	STATUS_CHANGE	status	APPROVED	COMPLETED	2025-06-11 04:19:28.286	cmbkufojh0000680ty85x3bu6	\N
cmbrgsp1h0006oq3nzfp5hmlz	cmbopksow000zpptr3shuqx0c	STATUS_CHANGE	status	REVIEW	IN_PROGRESS	2025-06-11 04:43:35.237	cmbkufojh0000680ty85x3bu6	\N
cmbrgsp1h0007oq3nnqkfc4r7	cmbopksow000zpptr3shuqx0c	UPDATE	creativeBriefingExample		4646	2025-06-11 04:43:35.237	cmbkufojh0000680ty85x3bu6	\N
cmbrgsp1h0008oq3n6mb71fjr	cmbopksow000zpptr3shuqx0c	UPDATE	copyExample		6544575	2025-06-11 04:43:35.237	cmbkufojh0000680ty85x3bu6	\N
cmbrgsp1h0009oq3n2vhy8qso	cmbopksow000zpptr3shuqx0c	UPDATE	action		4757	2025-06-11 04:43:35.237	cmbkufojh0000680ty85x3bu6	\N
cmbrgt597000coq3noyczybvr	cmbopksoq000vpptrp8synmy3	STATUS_CHANGE	status	APPROVED	COMPLETED	2025-06-11 04:43:56.252	cmbkufojh0000680ty85x3bu6	\N
cmbrlocxq000213gckkn0etnb	6b72b02b-7c25-42f7-aabc-c95708486259	STATUS_CHANGE	status	APPROVED	COMPLETED	2025-06-11 07:00:11.006	cmbkufojh0000680ty85x3bu6	\N
cmbrm36mh000313gcez3y4h09	cmbkugpdi000xsmqzkj7xne6p	STATUS_CHANGE	status	IN_PROGRESS	APPROVED	2025-06-11 07:11:42.665	cmbkufojh0000680ty85x3bu6	\N
cmbrm3v8l000613gci3r46u3t	cmbkugpdi000xsmqzkj7xne6p	STATUS_CHANGE	status	APPROVED	COMPLETED	2025-06-11 07:12:14.566	cmbkufojh0000680ty85x3bu6	\N
cmbs1dkrv00007u47ewnc45xa	5a8b22f1-8d06-43c8-804d-9e1266088eff	UPDATE	monat	2024-03	Juni	2025-06-11 14:19:41.803	cmbkufojh0000680ty85x3bu6	\N
cmbs1dkrv00017u47qmvazrvx	5a8b22f1-8d06-43c8-804d-9e1266088eff	UPDATE	bezug	Frühlingsanfang	Vielfalt	2025-06-11 14:19:41.803	cmbkufojh0000680ty85x3bu6	\N
cmbs1dkrv00027u47pihk3tih	5a8b22f1-8d06-43c8-804d-9e1266088eff	UPDATE	platzierung	Intranet + E-Mail	FB + IG	2025-06-11 14:19:41.803	cmbkufojh0000680ty85x3bu6	\N
cmbs1dkrv00037u47yvsw6c1n	5a8b22f1-8d06-43c8-804d-9e1266088eff	UPDATE	implementationLevel		EINFACH	2025-06-11 14:19:41.803	cmbkufojh0000680ty85x3bu6	\N
cmbs1e1h600047u47lzwsthzy	5a8b22f1-8d06-43c8-804d-9e1266088eff	UPDATE	creativeBriefingExample		ete	2025-06-11 14:20:03.45	cmbkufojh0000680ty85x3bu6	\N
cmbs1e1h600057u47dcxb3mb5	5a8b22f1-8d06-43c8-804d-9e1266088eff	UPDATE	copyExample		rez	2025-06-11 14:20:03.45	cmbkufojh0000680ty85x3bu6	\N
cmbs1e1h600067u47be2pohqv	5a8b22f1-8d06-43c8-804d-9e1266088eff	UPDATE	copyExampleCustomized		erz	2025-06-11 14:20:03.45	cmbkufojh0000680ty85x3bu6	\N
cmbs1e1h600077u47h4jzuiq6	5a8b22f1-8d06-43c8-804d-9e1266088eff	UPDATE	firstCommentForEngagement		erz	2025-06-11 14:20:03.45	cmbkufojh0000680ty85x3bu6	\N
cmbs1e1h600087u47rf53avj0	5a8b22f1-8d06-43c8-804d-9e1266088eff	UPDATE	action		ete	2025-06-11 14:20:03.45	cmbkufojh0000680ty85x3bu6	\N
cmbs1eqeg00097u47xif45dzi	5a8b22f1-8d06-43c8-804d-9e1266088eff	STATUS_CHANGE	status	DRAFT	APPROVED	2025-06-11 14:20:35.753	cmbkufojh0000680ty85x3bu6	\N
cmbs1ff66000c7u47bwh8ptd8	5a8b22f1-8d06-43c8-804d-9e1266088eff	STATUS_CHANGE	status	APPROVED	COMPLETED	2025-06-11 14:21:07.855	cmbkufojh0000680ty85x3bu6	\N
cmbs20cwd000d7u47stiwfthr	cmbkugpdb000tsmqzmqscakwd	UPDATE	notes		568	2025-06-11 14:37:24.685	cmbkufojh0000680ty85x3bu6	\N
cmbs20cwd000e7u47f3sd6y6k	cmbkugpdb000tsmqzmqscakwd	UPDATE	creativeBriefingExample		587568	2025-06-11 14:37:24.685	cmbkufojh0000680ty85x3bu6	\N
cmbs20cwd000f7u4730pjqnxz	cmbkugpdb000tsmqzmqscakwd	UPDATE	copyExample		56868	2025-06-11 14:37:24.685	cmbkufojh0000680ty85x3bu6	\N
cmbs20cwd000g7u47hml2dafg	cmbkugpdb000tsmqzmqscakwd	UPDATE	copyExampleCustomized		56868	2025-06-11 14:37:24.685	cmbkufojh0000680ty85x3bu6	\N
cmbs20cwd000h7u47rbztwzyc	cmbkugpdb000tsmqzmqscakwd	UPDATE	firstCommentForEngagement		868	2025-06-11 14:37:24.685	cmbkufojh0000680ty85x3bu6	\N
cmbs20cwd000i7u473cbiq9zi	cmbkugpdb000tsmqzmqscakwd	UPDATE	action		6587	2025-06-11 14:37:24.685	cmbkufojh0000680ty85x3bu6	\N
cmbs20sbw000j7u47cv9kihka	cmbkugpdb000tsmqzmqscakwd	UPDATE	monat	Januar	Juni	2025-06-11 14:37:44.684	cmbkufojh0000680ty85x3bu6	\N
cmbs20sbw000k7u47iakcyu56	cmbkugpdb000tsmqzmqscakwd	STATUS_CHANGE	status	IN_PROGRESS	APPROVED	2025-06-11 14:37:44.684	cmbkufojh0000680ty85x3bu6	\N
cmbs21855000n7u472e7xp622	cmbkugpdb000tsmqzmqscakwd	STATUS_CHANGE	status	APPROVED	COMPLETED	2025-06-11 14:38:05.178	cmbkufojh0000680ty85x3bu6	\N
cmc1mzvz3000064a5op8hhg3p	cmbopksow000zpptr3shuqx0c	UPDATE	bezug	Vielfalt	Saisonal	2025-06-18 07:34:50.271	cmbkufojh0000680ty85x3bu6	\N
cmc1mzvz3000164a58hxmkno3	cmbopksow000zpptr3shuqx0c	UPDATE	notes		erg	2025-06-18 07:34:50.271	cmbkufojh0000680ty85x3bu6	\N
cmc1mzvz3000264a5lggn9jzl	cmbopksow000zpptr3shuqx0c	UPDATE	copyExampleCustomized		ewfer	2025-06-18 07:34:50.271	cmbkufojh0000680ty85x3bu6	\N
cmc1mzvz3000364a56cw923jm	cmbopksow000zpptr3shuqx0c	UPDATE	firstCommentForEngagement		rgert	2025-06-18 07:34:50.271	cmbkufojh0000680ty85x3bu6	\N
cmc32p3zt0002cha1yajvejt0	c3a27acb-fd41-4709-9347-e8de54a9429d	STATUS_CHANGE	status	APPROVED	COMPLETED	2025-06-19 07:42:07.481	cmbkufojh0000680ty85x3bu6	\N
cmcq37ak00000e7cagc7rrkw2	cmbopksow000zpptr3shuqx0c	STATUS_CHANGE	status	IN_PROGRESS	REVIEW	2025-07-05 10:14:57.84	cmbkufojh0000680ty85x3bu6	\N
cmcq37ak00001e7caax3mhjm4	cmbopksow000zpptr3shuqx0c	UPDATE	Standort	Berlin Office	Hamburg Office	2025-07-05 10:14:57.84	cmbkufojh0000680ty85x3bu6	\N
cmcq3808d0002e7catasinzx1	cmbopksow000zpptr3shuqx0c	STATUS_CHANGE	status	REVIEW	APPROVED	2025-07-05 10:15:31.118	cmbkufojh0000680ty85x3bu6	\N
cmcq3873b0005e7ca24n3otd3	cmbopksow000zpptr3shuqx0c	STATUS_CHANGE	status	APPROVED	COMPLETED	2025-07-05 10:15:40.008	cmbkufojh0000680ty85x3bu6	\N
cmcq58q4w0000wc27zno4igyl	cmcq2eh520001pv7fsz8sv02x	STATUS_CHANGE	status	DRAFT	APPROVED	2025-07-05 11:12:03.92	cmbkufojh0000680ty85x3bu6	\N
cmcq58xqe0003wc2757n2f7x2	cmcq2eh520001pv7fsz8sv02x	STATUS_CHANGE	status	APPROVED	COMPLETED	2025-07-05 11:12:13.767	cmbkufojh0000680ty85x3bu6	\N
cmcqbik5e0006ybeerwivdgf9	fd27e060-d07b-42b5-84f8-ee8f01d92077	UPDATE	monat	2024-10	Januar	2025-07-05 14:07:40.418	cmbkufojh0000680ty85x3bu6	\N
cmcqbik5e0007ybee1ei9eefc	fd27e060-d07b-42b5-84f8-ee8f01d92077	UPDATE	bezug	Halloween	Vielfalt	2025-07-05 14:07:40.418	cmbkufojh0000680ty85x3bu6	\N
cmcqbik5e0008ybeevlif4dsf	fd27e060-d07b-42b5-84f8-ee8f01d92077	UPDATE	platzierung	Social Media + Fotos	Facebook	2025-07-05 14:07:40.418	cmbkufojh0000680ty85x3bu6	\N
cmcqbik5e0009ybeeeyq6kop8	fd27e060-d07b-42b5-84f8-ee8f01d92077	STATUS_CHANGE	status	DRAFT	APPROVED	2025-07-05 14:07:40.418	cmbkufojh0000680ty85x3bu6	\N
cmcqbiti7000eybeez2t8xe53	fd27e060-d07b-42b5-84f8-ee8f01d92077	STATUS_CHANGE	status	APPROVED	COMPLETED	2025-07-05 14:07:52.543	cmbkufojh0000680ty85x3bu6	\N
cmcqbyqs5000rybee3yuq21hi	2a79279e-51fa-4f6e-a145-1713bb703520	UPDATE	monat	2024-09	August	2025-07-05 14:20:15.509	cmbkufojh0000680ty85x3bu6	\N
cmcqbyqs5000sybeeo1f7qsta	2a79279e-51fa-4f6e-a145-1713bb703520	UPDATE	bezug	Herbstbeginn	Vielfalt	2025-07-05 14:20:15.509	cmbkufojh0000680ty85x3bu6	\N
cmcqbyqs5000tybeepisya0zj	2a79279e-51fa-4f6e-a145-1713bb703520	UPDATE	platzierung	Alle Kanäle	Instagram	2025-07-05 14:20:15.509	cmbkufojh0000680ty85x3bu6	\N
cmcqbz2zo000uybeejcn5edzk	49f16a8c-778d-4a1e-8f32-f38588d2e7c6	UPDATE	monat	2024-07	März	2025-07-05 14:20:31.333	cmbkufojh0000680ty85x3bu6	\N
cmcqbz2zo000vybeenc0d6xfz	49f16a8c-778d-4a1e-8f32-f38588d2e7c6	UPDATE	bezug	Urlaubszeit	Vielfalt	2025-07-05 14:20:31.333	cmbkufojh0000680ty85x3bu6	\N
cmcqbz2zo000wybee9uxn4d4z	49f16a8c-778d-4a1e-8f32-f38588d2e7c6	UPDATE	platzierung	Intranet + Blog	Instagram	2025-07-05 14:20:31.333	cmbkufojh0000680ty85x3bu6	\N
cmcqbzeht000xybeek243vxvn	49b28e2f-dd37-4a3e-b359-fd2ff3aa0349	UPDATE	monat	2024-06	August	2025-07-05 14:20:46.241	cmbkufojh0000680ty85x3bu6	\N
cmcqbzeht000yybeeal5u1hec	49b28e2f-dd37-4a3e-b359-fd2ff3aa0349	UPDATE	bezug	Sommeranfang	Event	2025-07-05 14:20:46.241	cmbkufojh0000680ty85x3bu6	\N
cmcqbzeht000zybeeqjv4q3q2	49b28e2f-dd37-4a3e-b359-fd2ff3aa0349	UPDATE	platzierung	App + Newsletter	FB + IG	2025-07-05 14:20:46.241	cmbkufojh0000680ty85x3bu6	\N
cmcqbzojh0010ybee67jkhssh	37248d57-3497-48f1-bcf6-35e59cafd3c4	UPDATE	monat	2024-02	September	2025-07-05 14:20:59.261	cmbkufojh0000680ty85x3bu6	\N
cmcqbzojh0011ybeefh12xoas	37248d57-3497-48f1-bcf6-35e59cafd3c4	UPDATE	bezug	Valentinstag	Saisonal	2025-07-05 14:20:59.261	cmbkufojh0000680ty85x3bu6	\N
cmcqbzojh0012ybeeac75z2bw	37248d57-3497-48f1-bcf6-35e59cafd3c4	UPDATE	platzierung	Social Media + Plakate	Instagram	2025-07-05 14:20:59.261	cmbkufojh0000680ty85x3bu6	\N
cmcqceswt0019ybeeqp9laa46	49f16a8c-778d-4a1e-8f32-f38588d2e7c6	STATUS_CHANGE	status	DRAFT	APPROVED	2025-07-05 14:32:44.766	cmbkufojh0000680ty85x3bu6	\N
cmcqceswt001aybee408hfprv	49f16a8c-778d-4a1e-8f32-f38588d2e7c6	UPDATE	implementationLevel		EINFACH	2025-07-05 14:32:44.766	cmbkufojh0000680ty85x3bu6	\N
cmcrhtu6u000012ofrwcttvlu	37248d57-3497-48f1-bcf6-35e59cafd3c4	UPDATE	platzierung	Instagram	Facebook	2025-07-06 09:52:10.519	cmbkufojh0000680ty85x3bu6	\N
cmcrhtu6u000112ofv59glvnf	37248d57-3497-48f1-bcf6-35e59cafd3c4	STATUS_CHANGE	status	IN_PROGRESS	REVIEW	2025-07-06 09:52:10.519	cmbkufojh0000680ty85x3bu6	\N
cmcs389he000sszt80i0xqfbj	37248d57-3497-48f1-bcf6-35e59cafd3c4	STATUS_CHANGE	status	REVIEW	APPROVED	2025-07-06 19:51:15.458	cmbkufojh0000680ty85x3bu6	\N
cmcs38f66000xszt8pjw6n1x4	37248d57-3497-48f1-bcf6-35e59cafd3c4	STATUS_CHANGE	status	APPROVED	COMPLETED	2025-07-06 19:51:22.83	cmbkufojh0000680ty85x3bu6	\N
\.


--
-- Data for Name: InputPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InputPlan" (id, "contentPlanId", monat, bezug, mehrwert, "mechanikThema", idee, platzierung, status, voe, zusatzinfo, "gptResult", "locationId", "createdById", "updatedById", "createdAt", "updatedAt", notes, action, flag, "implementationLevel", "creativeFormat", "creativeBriefingExample", "copyExample", "copyExampleCustomized", "firstCommentForEngagement", "n8nResult", "voeDate", "deletedAt", "deletedById") FROM stdin;
cmbkugpdo0011smqzcmkf1cgx	cmbkugpdb000tsmqzmqscakwd	2025-01	Neujahr	Neujahrsvorsätze und gesunde Ernährung	Social Media Kampagne	10 Tipps für einen gesunden Start ins neue Jahr	Instagram, Facebook	COMPLETED	2025-01-02 00:00:00	Fokus auf praktische, umsetzbare Tipps. Zielgruppe: 25-45 Jahre	\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.197	2025-06-06 13:31:47.197	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbkugpdt0013smqzlnpgr5kt	cmbkugpdf000vsmqzio900z9z	2025-02	Valentinstag	Romantische Geschenkideen	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	COMPLETED	2025-02-07 00:00:00	Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.	\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-06 13:31:47.202	2025-06-06 14:40:44.823	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbopksoz0011pptr0sy8aijx	cmbopksok000tpptr3d6c7svs	2025-01	Neujahr	Neujahrsvorsätze und gesunde Ernährung	Social Media Kampagne	10 Tipps für einen gesunden Start ins neue Jahr	Instagram, Facebook	COMPLETED	2025-01-02 00:00:00	Fokus auf praktische, umsetzbare Tipps. Zielgruppe: 25-45 Jahre	\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-09 06:26:04.739	2025-06-09 06:26:04.739	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbs1fdub000b7u47ujshfnzv	5a8b22f1-8d06-43c8-804d-9e1266088eff	Juni	Vielfalt	Motivation und Aufbruch	Nachhaltigkeit	Green Office Initiative	FB + IG	COMPLETED	2025-06-19 00:00:00		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 14:21:06.131	2025-06-16 15:19:44.932	\N	ete	f	EINFACH	\N	ete	rez	erz	erz	\N	\N	\N	\N
cmbrfxjl00004oq3nwyvxpynd	cmbkugpdl000zsmqzjgtlloqr	Februar	Vielfalt	Familienzeit und Traditionen	DIY-Anleitung	Osterdeko selbst gemacht - 3 einfache Ideen	FB + IG	COMPLETED	2025-06-18 00:00:00		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 04:19:21.828	2025-07-05 10:15:51.235	test	test	f	EINFACH	test	test	test	test	tst	\N	\N	\N	\N
cmbkvw7w10003ovh60g5wr0h6	cmbkugpdf000vsmqzio900z9z	Februar	Vielfalt	Romantische Geschenkideen	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Facebook	COMPLETED	2025-07-23 00:00:00		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-06 14:11:50.641	2025-07-05 11:20:12.881	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbopksp30013pptritd9jnfx	cmbopksoq000vpptrp8synmy3	Dezember	Weihnachten Test	Romantische Geschenkideen	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	COMPLETED	2025-12-23 00:00:00	Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS	\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-09 06:26:04.743	2025-07-06 11:12:39.351	46as	57	f	66	77	ewtaS	436asA	436	46	\N	\N	\N	\N
cmbkvfkts0001ovh65i3wpvxv	cmbkugpdl000zsmqzjgtlloqr	Februar	Vielfalt	Familienzeit und Traditionen	DIY-Anleitung	Osterdeko selbst gemacht - 3 einfache Ideen	FB + IG	IN_PROGRESS	2025-07-31 00:00:00		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufokv0001680tkeor7ce5	2025-06-06 13:58:54.257	2025-07-06 09:20:53.605	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbrlo8va000113gc6133g9ti	6b72b02b-7c25-42f7-aabc-c95708486259	August	Ostern	Work-Life-Balance	Familienfreundlichkeit	Oster-Event für Mitarbeiterkinder	Newsletter + Flyer	DRAFT	\N		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 07:00:05.735	2025-07-06 10:10:23.565	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbs216wu000m7u471io55pu8	c3a27acb-fd41-4709-9347-e8de54a9429d	August	Neujahr 2024	Gesundheitstipps für den Start	Neujahrsvorsätze	Fitness-Challenge für Mitarbeiter	Intranet + Newsletter	DRAFT	\N		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 14:38:03.582	2025-07-06 10:10:34.627	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbrm3u6l000513gckrw1z3gf	c3a27acb-fd41-4709-9347-e8de54a9429d	August	Neujahr 2024	Gesundheitstipps für den Start	Neujahrsvorsätze	Fitness-Challenge für Mitarbeiter	Intranet + Newsletter	DRAFT	\N		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 07:12:13.197	2025-07-06 10:10:40.8	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbrgt47k000boq3nilh5jjar	c3a27acb-fd41-4709-9347-e8de54a9429d	August	Neujahr 2024	Gesundheitstipps für den Start	Neujahrsvorsätze	Fitness-Challenge für Mitarbeiter	Intranet + Newsletter	REVIEW	\N	\N	\N	cmbkufomt0004680tx8c7wjrw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 04:43:54.896	2025-07-06 10:10:49.512	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbrfwwrj0001oq3nh5xhl6nw	6b72b02b-7c25-42f7-aabc-c95708486259	August	Ostern	Work-Life-Balance	Familienfreundlichkeit	Oster-Event für Mitarbeiterkinder	Newsletter + Flyer	COMPLETED	2025-07-17 00:00:00		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 04:18:52.253	2025-07-06 11:12:39.349	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmcq58wiy0002wc27prr1j86g	cmcq2eh520001pv7fsz8sv02x	Juli	Saisonal	abhängig von thematischer Ausführung	Summer Vibes  – Fokusthema	Wir spielen Sommer Memory mit den Besuchenden im Center.	Facebook	COMPLETED	2025-07-02 00:00:00		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-07-05 11:12:12.202	2025-07-05 11:12:49.834	\N	\N	f	MITTEL	Video	Reel:\nVon Mode über Accessoires bis hin zu coolen Reise-Gadgets zeigt der Creator, was das Center zubieten hat und stellt sich gleichzeitig der Guess the Price Challenge. Die Follower können ihren Tipp in den Kommentaren abgeben. Dabei liegt der Fokus auf Interaktion, Spaß und dem Entdecken aktueller Sommertrends. \nZiel: Aufmerksamkeit, Engagement und Shopping-Inspiration für die warme Jahreszeit.\n\nBeispiel: https://www.instagram.com/p/DHyKKpkitv0/	Hättest du die Preise richtig geraten? 👀 💸 	Erweiterung als Gewinnspiel möglich:\nWer den Preis richtig tippt, gewinnt einen Gutschein fürs Center! Sommer-Essentials shoppen und dabei abstauben – let’s go! 🕶️🩴	Guter Vorschlag können wir so umsetzen	\N	\N	\N	\N
cmc32p2hg0001cha1batcc96k	c3a27acb-fd41-4709-9347-e8de54a9429d	April	Neujahr 2024	Gesundheitstipps für den Start	Neujahrsvorsätze	Fitness-Challenge für Mitarbeiter	Intranet + Newsletter	DRAFT	\N		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-19 07:42:05.523	2025-07-06 10:10:30.214	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmcq385xy0004e7cae55qgcgk	cmbopksow000zpptr3shuqx0c	Februar	Saisonal	Familienzeit und Traditionen	DIY-Anleitung Test	Osterdeko selbst gemacht - 3 einfache Ideen	Instagram	COMPLETED	2025-07-04 00:00:00		\N	cmbkufomt0004680tx8c7wjrw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-07-05 10:15:38.518	2025-07-06 10:46:26.444	erg	4757	f	\N	\N	4646	6544575	ewfer	rgert	\N	\N	\N	\N
cmcqbis5r000bybee6trm0ykq	fd27e060-d07b-42b5-84f8-ee8f01d92077	Januar	Vielfalt	Teambuilding	Kreativität	Kostümwettbewerb im Büro	Facebook	COMPLETED	2025-09-03 00:00:00	ertrezrez	\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-07-05 14:07:50.799	2025-07-06 11:18:13.248	zerzerzer	dsf	f	wr	f	sdf	dfs	dsf	ertzerzre	\N	\N	\N	\N
cmcs38dpf000uszt8k65vz13a	49f16a8c-778d-4a1e-8f32-f38588d2e7c6	März	Vielfalt	Erholung und Produktivität	Urlaubstipps	Vacation Sharing Platform	Instagram	DRAFT	\N		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-07-06 19:51:20.931	2025-07-06 19:51:20.931	\N	\N	f	EINFACH	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: InputPlanHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InputPlanHistory" (id, "inputPlanId", field, "oldValue", "newValue", "changedById", "changedAt", action, "changedBy", "createdAt", "newData", "previousData") FROM stdin;
9c5973b2-96a5-4a7c-9f89-c598f7f9eacb	cmbrlo8va000113gc6133g9ti	created	\N	Neuer InputPlan erstellt	cmbkufojh0000680ty85x3bu6	2025-06-11 07:00:05.739	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
713b5039-5bd3-4c70-b097-ed92c204a397	cmbrm3u6l000513gckrw1z3gf	created	\N	Neuer InputPlan erstellt	cmbkufojh0000680ty85x3bu6	2025-06-11 07:12:13.202	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
91426338-3fb8-4d8e-b7dd-235813fc471d	cmbs1fdub000b7u47ujshfnzv	created	\N	Neuer InputPlan erstellt	cmbkufojh0000680ty85x3bu6	2025-06-11 14:21:06.137	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
dff54948-b68a-4c12-961c-2db354070f80	cmbs216wu000m7u471io55pu8	created	\N	Neuer InputPlan erstellt	cmbkufojh0000680ty85x3bu6	2025-06-11 14:38:03.587	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
9cecd0da-19d8-4154-877c-505e7e6f9ae2	cmbs1fdub000b7u47ujshfnzv	voe	Wed Jun 18 2025 02:00:00 GMT+0200 (Central European Summer Time)	2025-06-19T00:00:00.000Z	cmbkufojh0000680ty85x3bu6	2025-06-16 15:15:37.749	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
ff1fe278-064a-4f07-b867-5283f735131e	cmbrfxjl00004oq3nwyvxpynd	voe		2025-06-18T00:00:00.000Z	cmbkufojh0000680ty85x3bu6	2025-06-16 15:16:14.552	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
8d1ad081-36c3-47a9-945e-5ac0c6f8228f	cmbrfxjl00004oq3nwyvxpynd	status	DRAFT	APPROVED	cmbkufojh0000680ty85x3bu6	2025-06-16 15:16:17.849	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
c9eb9e5e-bcc0-4d2f-a681-e08481038dab	cmc32p2hg0001cha1batcc96k	created	\N	Neuer InputPlan erstellt	cmbkufojh0000680ty85x3bu6	2025-06-19 07:42:05.539	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
5aafa8d3-e744-4513-9e65-ecaf8c3f1785	cmcq385xy0004e7cae55qgcgk	created	\N	Neuer InputPlan erstellt	cmbkufojh0000680ty85x3bu6	2025-07-05 10:15:38.524	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
670e2a84-01f6-48cb-a7cf-781d93a04452	cmcq58wiy0002wc27prr1j86g	created	\N	Neuer InputPlan erstellt	cmbkufojh0000680ty85x3bu6	2025-07-05 11:12:12.206	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
1c967c34-0789-4b06-b79f-3a6bfce0199b	cmcq58wiy0002wc27prr1j86g	status	DRAFT	IN_PROGRESS	cmbkufojh0000680ty85x3bu6	2025-07-05 11:12:32.31	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
a2436091-bc44-4bd4-a143-74e05a516b73	cmcq58wiy0002wc27prr1j86g	voe	\N	2025-07-02T00:00:00.000Z	cmbkufojh0000680ty85x3bu6	2025-07-05 11:12:32.31	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
825b977e-2764-422e-9687-8b6065643f6f	cmcq58wiy0002wc27prr1j86g	status	IN_PROGRESS	APPROVED	cmbkufojh0000680ty85x3bu6	2025-07-05 11:12:46.042	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
4fbbb087-1f23-4238-8c6b-999cd21fa81e	cmcq385xy0004e7cae55qgcgk	status	DRAFT	IN_PROGRESS	cmbkufojh0000680ty85x3bu6	2025-07-05 11:18:17.043	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
309485b3-be25-4576-8041-404dc4d99e17	cmbkvw7w10003ovh60g5wr0h6	status	REVIEW	IN_PROGRESS	cmbkufojh0000680ty85x3bu6	2025-07-05 11:19:19.073	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
e15e4f9c-9786-40f0-9b90-851f732a2fce	cmbkvw7w10003ovh60g5wr0h6	status	IN_PROGRESS	REVIEW	cmbkufojh0000680ty85x3bu6	2025-07-05 11:19:26.743	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
337798b2-77fc-40d0-be51-acbededcfc88	cmbkvw7w10003ovh60g5wr0h6	status	REVIEW	APPROVED	cmbkufojh0000680ty85x3bu6	2025-07-05 11:19:37.234	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
e9b97bd6-bd5f-44f6-aea9-5ff13c678a5b	cmbkvw7w10003ovh60g5wr0h6	status	APPROVED	COMPLETED	cmbkufojh0000680ty85x3bu6	2025-07-05 11:20:12.883	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
dca9f2af-e2e2-420f-9a11-408eb12a8ec7	cmbkvw7w10003ovh60g5wr0h6	voe	\N	2025-07-23T00:00:00.000Z	cmbkufojh0000680ty85x3bu6	2025-07-05 11:20:12.883	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
08dadc04-845c-447a-b84a-59db04cf52fb	cmbopksp30013pptritd9jnfx	status	REVIEW	DRAFT	cmbkufojh0000680ty85x3bu6	2025-07-05 11:23:11.142	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
0c49ea15-3b63-43c3-ae8c-15953127e57a	cmbrfwwrj0001oq3nh5xhl6nw	status	DRAFT	APPROVED	cmbkufojh0000680ty85x3bu6	2025-07-05 11:26:00.713	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
41afd698-2b53-4c4c-bfab-93256ca40566	cmbrfwwrj0001oq3nh5xhl6nw	voe	\N	2025-07-17T00:00:00.000Z	cmbkufojh0000680ty85x3bu6	2025-07-05 11:26:22.153	UPDATE	System	2025-07-05 12:44:12.609	\N	\N
cmcqbis5v000dybee3u2gesgd	cmcqbis5r000bybee6trm0ykq	created	\N	Neuer InputPlan erstellt	cmbkufojh0000680ty85x3bu6	2025-07-05 14:07:50.804	UPDATE	System	2025-07-05 14:07:50.804	\N	\N
cmcrb4a390001sz0g3vh4grwk	cmcqbis5r000bybee6trm0ykq	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 06:44:20.373	UPDATE	Test User	2025-07-06 06:44:20.373	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T06:44:20.362Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": null, "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-05T14:07:50.799Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcrgtron000dszt810tecxv7	cmbopksp30013pptritd9jnfx	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 09:24:07.655	UPDATE	Test User	2025-07-06 09:24:07.655	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-24T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "APPROVED", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:24:07.648Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-02-07T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Valentinstag", "monat": "2025-02", "notes": null, "action": null, "status": "APPROVED", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-05T14:09:08.056Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcrb4nuq0003sz0gg0z47bcn	cmbkvfkts0001ovh65i3wpvxv	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 06:44:38.21	UPDATE	Test User	2025-07-06 06:44:38.21	{"id": "cmbkvfkts0001ovh65i3wpvxv", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Osterdeko selbst gemacht - 3 einfache Ideen", "bezug": "Vielfalt", "monat": "Februar", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Familienzeit und Traditionen", "createdAt": "2025-06-06T13:58:54.257Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T06:44:38.203Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "FB + IG", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbkugpdl000zsmqzjgtlloqr", "mechanikThema": "DIY-Anleitung", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}	{"id": "cmbkvfkts0001ovh65i3wpvxv", "voe": null, "flag": false, "idee": "Osterdeko selbst gemacht - 3 einfache Ideen", "bezug": "Vielfalt", "monat": "Februar", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "mehrwert": "Familienzeit und Traditionen", "createdAt": "2025-06-06T13:58:54.257Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-06-06T13:58:54.257Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "FB + IG", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "cmbkugpdl000zsmqzjgtlloqr", "mechanikThema": "DIY-Anleitung", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcrbkja20001szhkwxqbnny1	cmcqbis5r000bybee6trm0ykq	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 06:56:58.779	UPDATE	Test User	2025-07-06 06:56:58.779	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": null, "action": null, "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T06:56:58.770Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T06:44:20.362Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcrfut1j0001szt8z9jz3ia4	cmcqbis5r000bybee6trm0ykq	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 08:56:56.455	UPDATE	Test User	2025-07-06 08:56:56.455	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": null, "action": null, "status": "REVIEW", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T08:56:56.445Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": null, "action": null, "status": "IN_PROGRESS", "voeDate": null, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T06:56:58.770Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcrg5vvf0003szt8xim90u62	cmcqbis5r000bybee6trm0ykq	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 09:05:33.34	UPDATE	Test User	2025-07-06 09:05:33.34	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": null, "action": null, "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:05:33.334Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": null, "action": null, "status": "REVIEW", "voeDate": null, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T08:56:56.445Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcrgb4d30005szt8mp8hf27j	cmcqbis5r000bybee6trm0ykq	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 09:09:37.623	UPDATE	Test User	2025-07-06 09:09:37.623	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "dsf", "action": "dsf", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:09:37.617Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "dsf", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "df"}	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": null, "action": null, "status": "IN_PROGRESS", "voeDate": null, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:05:33.334Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcrgfxcc0007szt8mv6up2c8	cmcqbis5r000bybee6trm0ykq	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 09:13:21.805	UPDATE	Test User	2025-07-06 09:13:21.805	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "zerzerzer", "action": "dsf", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:13:21.799Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "ertrezrez", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "ertzerzre"}	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "dsf", "action": "dsf", "status": "IN_PROGRESS", "voeDate": null, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:09:37.617Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "dsf", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "df"}
cmcrgmkc40009szt8kwqlmoss	cmcqbis5r000bybee6trm0ykq	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 09:18:31.54	UPDATE	Test User	2025-07-06 09:18:31.54	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-08-09T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "zerzerzer", "action": "dsf", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:18:31.533Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "ertrezrez", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "ertzerzre"}	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "zerzerzer", "action": "dsf", "status": "IN_PROGRESS", "voeDate": null, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:13:21.799Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "ertrezrez", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "ertzerzre"}
cmcrgplyk000bszt8ngmptlyz	cmbkvfkts0001ovh65i3wpvxv	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 09:20:53.612	UPDATE	Test User	2025-07-06 09:20:53.612	{"id": "cmbkvfkts0001ovh65i3wpvxv", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Osterdeko selbst gemacht - 3 einfache Ideen", "bezug": "Vielfalt", "monat": "Februar", "notes": null, "action": null, "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Familienzeit und Traditionen", "createdAt": "2025-06-06T13:58:54.257Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:20:53.605Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "FB + IG", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbkugpdl000zsmqzjgtlloqr", "mechanikThema": "DIY-Anleitung", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}	{"id": "cmbkvfkts0001ovh65i3wpvxv", "voe": "2025-07-31T00:00:00.000Z", "flag": false, "idee": "Osterdeko selbst gemacht - 3 einfache Ideen", "bezug": "Vielfalt", "monat": "Februar", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "mehrwert": "Familienzeit und Traditionen", "createdAt": "2025-06-06T13:58:54.257Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T06:44:38.203Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "FB + IG", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbkugpdl000zsmqzjgtlloqr", "mechanikThema": "DIY-Anleitung", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcrgzy9r000fszt8kre3x5q2	cmcqbis5r000bybee6trm0ykq	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 09:28:56.127	UPDATE	Test User	2025-07-06 09:28:56.127	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-08-28T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "zerzerzer", "action": "dsf", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:28:56.120Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "ertrezrez", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "ertzerzre"}	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-08-09T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "zerzerzer", "action": "dsf", "status": "IN_PROGRESS", "voeDate": null, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:18:31.533Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "ertrezrez", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "ertzerzre"}
cmcrh0o34000hszt8vcskjx83	cmbopksp30013pptritd9jnfx	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 09:29:29.584	UPDATE	Test User	2025-07-06 09:29:29.584	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-23T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "APPROVED", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:29:29.579Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-24T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "APPROVED", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:24:07.648Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}
cmcrh2rri000jszt88xps0sko	cmbopksp30013pptritd9jnfx	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 09:31:07.663	UPDATE	Test User	2025-07-06 09:31:07.663	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-24T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "APPROVED", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:31:07.656Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-23T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "APPROVED", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:29:29.579Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}
cmcrh4exp000lszt82eabvdyv	cmbopksp30013pptritd9jnfx	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 09:32:24.35	UPDATE	Test User	2025-07-06 09:32:24.35	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-24T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:32:24.345Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-24T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "APPROVED", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:31:07.656Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}
cmcrh8srz000nszt8r3uvsnzg	cmbopksp30013pptritd9jnfx	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 09:35:48.912	UPDATE	Test User	2025-07-06 09:35:48.912	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-23T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:35:48.904Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-24T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:32:24.345Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}
cmcrha3fq000pszt8bp9pz6zo	cmbopksp30013pptritd9jnfx	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 09:36:49.382	UPDATE	Test User	2025-07-06 09:36:49.382	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-24T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:36:49.376Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-23T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:35:48.904Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}
cmcrhjwld000rszt8ml5lptyl	cmbopksp30013pptritd9jnfx	\N	\N	\N	cmbkufokv0001680tkeor7ce5	2025-07-06 09:44:27.074	UPDATE	Test User	2025-07-06 09:44:27.074	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-22T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:44:27.066Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-24T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:36:49.376Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}
cmcrho9nc0001l164emdfflj6	cmbopksp30013pptritd9jnfx	voe	Mon Dec 22 2025 01:00:00 GMT+0100 (Central European Standard Time)	2025-12-20T00:00:00.000Z	cmbkufokv0001680tkeor7ce5	2025-07-06 09:47:50.615	UPDATE	Test User	2025-07-06 09:47:50.616	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-20T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:47:50.610Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-22T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:44:27.066Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}
cmcrhp8180003l164ic55i2ys	cmbopksp30013pptritd9jnfx	creativeBriefingExample	ewt	ewtaS	cmbkufokv0001680tkeor7ce5	2025-07-06 09:48:35.179	UPDATE	Test User	2025-07-06 09:48:35.18	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-26T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46as", "action": "57", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:48:35.175Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-20T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:47:50.610Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}
cmcrhp81e0005l164gvvayk1r	cmbopksp30013pptritd9jnfx	copyExample	436	436asA	cmbkufokv0001680tkeor7ce5	2025-07-06 09:48:35.185	UPDATE	Test User	2025-07-06 09:48:35.186	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-26T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46as", "action": "57", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:48:35.175Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-20T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:47:50.610Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}
cmcrhp81h0007l164d25oplts	cmbopksp30013pptritd9jnfx	notes	46	46as	cmbkufokv0001680tkeor7ce5	2025-07-06 09:48:35.189	UPDATE	Test User	2025-07-06 09:48:35.189	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-26T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46as", "action": "57", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:48:35.175Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-20T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:47:50.610Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}
cmcrhp81k0009l1645t7bm704	cmbopksp30013pptritd9jnfx	zusatzinfo	Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.	Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS	cmbkufokv0001680tkeor7ce5	2025-07-06 09:48:35.192	UPDATE	Test User	2025-07-06 09:48:35.193	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-26T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46as", "action": "57", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:48:35.175Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-20T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:47:50.610Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}
cmcrhp81o000bl164qrqp9pg9	cmbopksp30013pptritd9jnfx	voe	Sat Dec 20 2025 01:00:00 GMT+0100 (Central European Standard Time)	2025-12-26T00:00:00.000Z	cmbkufokv0001680tkeor7ce5	2025-07-06 09:48:35.195	UPDATE	Test User	2025-07-06 09:48:35.196	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-26T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46as", "action": "57", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:48:35.175Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-20T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:47:50.610Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}
cmcrhp81r000dl164r08tod5t	cmbopksp30013pptritd9jnfx	status	REVIEW	IN_PROGRESS	cmbkufokv0001680tkeor7ce5	2025-07-06 09:48:35.199	UPDATE	Test User	2025-07-06 09:48:35.2	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-26T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46as", "action": "57", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:48:35.175Z", "updatedBy": {"id": "cmbkufokv0001680tkeor7ce5", "name": "Test User", "email": "user@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-20T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46", "action": "57", "status": "REVIEW", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:47:50.610Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.", "copyExample": "436", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewt", "firstCommentForEngagement": "46"}
cmcrhvxz5000312ofhtmai481	cmcqbis5r000bybee6trm0ykq	voe	Thu Aug 28 2025 02:00:00 GMT+0200 (Central European Summer Time)	2025-09-04T00:00:00.000Z	cmbkufojh0000680ty85x3bu6	2025-07-06 09:53:48.737	UPDATE	Admin User	2025-07-06 09:53:48.738	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-09-04T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "zerzerzer", "action": "dsf", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:53:48.730Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "ertrezrez", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "ertzerzre"}	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-08-28T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "zerzerzer", "action": "dsf", "status": "IN_PROGRESS", "voeDate": null, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:28:56.120Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "ertrezrez", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "ertzerzre"}
cmcri0mqr0001itgzgvjybbr0	cmcqbis5r000bybee6trm0ykq	voe	Thu Sep 04 2025 02:00:00 GMT+0200 (Central European Summer Time)	2025-09-03T00:00:00.000Z	cmbkufojh0000680ty85x3bu6	2025-07-06 09:57:27.458	UPDATE	Admin User	2025-07-06 09:57:27.459	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-09-03T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "zerzerzer", "action": "dsf", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:57:27.452Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "ertrezrez", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "ertzerzre"}	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-09-04T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "zerzerzer", "action": "dsf", "status": "IN_PROGRESS", "voeDate": null, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:53:48.730Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "ertrezrez", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "ertzerzre"}
cmcri8bii0001nirish1pkh1a	cmbopksp30013pptritd9jnfx	voe	Fri Dec 26 2025 01:00:00 GMT+0100 (Central European Standard Time)	2025-12-22T00:00:00.000Z	cmbkufojh0000680ty85x3bu6	2025-07-06 10:03:26.153	UPDATE	Admin User	2025-07-06 10:03:26.154	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-22T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46as", "action": "57", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:03:26.148Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-26T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46as", "action": "57", "status": "IN_PROGRESS", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:48:35.175Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufokv0001680tkeor7ce5", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}
cmcribblr0001tkxj09as8a1j	cmbopksp30013pptritd9jnfx	voe	Mon Dec 22 2025 01:00:00 GMT+0100 (Central European Standard Time)	2025-12-23T00:00:00.000Z	cmbkufojh0000680ty85x3bu6	2025-07-06 10:05:46.239	UPDATE	Admin User	2025-07-06 10:05:46.24	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-23T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46as", "action": "57", "status": "IN_PROGRESS", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:05:46.231Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-22T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46as", "action": "57", "status": "IN_PROGRESS", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:03:26.148Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}
cmcricxza0003tkxjlwozi76e	cmbrfwwrj0001oq3nh5xhl6nw	monat	2024-04	August	cmbkufojh0000680ty85x3bu6	2025-07-06 10:07:01.893	UPDATE	Admin User	2025-07-06 10:07:01.894	{"id": "cmbrfwwrj0001oq3nh5xhl6nw", "voe": "2025-07-17T00:00:00.000Z", "flag": false, "idee": "Oster-Event für Mitarbeiterkinder", "bezug": "Ostern", "monat": "August", "notes": null, "action": null, "status": "APPROVED", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Work-Life-Balance", "createdAt": "2025-06-11T04:18:52.253Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:07:01.889Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Newsletter + Flyer", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "6b72b02b-7c25-42f7-aabc-c95708486259", "mechanikThema": "Familienfreundlichkeit", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}	{"id": "cmbrfwwrj0001oq3nh5xhl6nw", "voe": "2025-07-17T00:00:00.000Z", "flag": false, "idee": "Oster-Event für Mitarbeiterkinder", "bezug": "Ostern", "monat": "2024-04", "notes": null, "action": null, "status": "APPROVED", "voeDate": null, "mehrwert": "Work-Life-Balance", "createdAt": "2025-06-11T04:18:52.253Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-05T11:26:22.151Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Newsletter + Flyer", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "6b72b02b-7c25-42f7-aabc-c95708486259", "mechanikThema": "Familienfreundlichkeit", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcrih9lf0005tkxj3ck3szks	cmbrlo8va000113gc6133g9ti	monat	2024-04	August	cmbkufojh0000680ty85x3bu6	2025-07-06 10:10:23.571	UPDATE	Admin User	2025-07-06 10:10:23.572	{"id": "cmbrlo8va000113gc6133g9ti", "voe": null, "flag": false, "idee": "Oster-Event für Mitarbeiterkinder", "bezug": "Ostern", "monat": "August", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Work-Life-Balance", "createdAt": "2025-06-11T07:00:05.735Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:10:23.565Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Newsletter + Flyer", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "6b72b02b-7c25-42f7-aabc-c95708486259", "mechanikThema": "Familienfreundlichkeit", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}	{"id": "cmbrlo8va000113gc6133g9ti", "voe": null, "flag": false, "idee": "Oster-Event für Mitarbeiterkinder", "bezug": "Ostern", "monat": "2024-04", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "mehrwert": "Work-Life-Balance", "createdAt": "2025-06-11T07:00:05.735Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-06-11T07:00:05.735Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Newsletter + Flyer", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "6b72b02b-7c25-42f7-aabc-c95708486259", "mechanikThema": "Familienfreundlichkeit", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcriheq40007tkxjdhi9ao5r	cmc32p2hg0001cha1batcc96k	monat	2024-01	April	cmbkufojh0000680ty85x3bu6	2025-07-06 10:10:30.22	UPDATE	Admin User	2025-07-06 10:10:30.221	{"id": "cmc32p2hg0001cha1batcc96k", "voe": null, "flag": false, "idee": "Fitness-Challenge für Mitarbeiter", "bezug": "Neujahr 2024", "monat": "April", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Gesundheitstipps für den Start", "createdAt": "2025-06-19T07:42:05.523Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:10:30.214Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Intranet + Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "c3a27acb-fd41-4709-9347-e8de54a9429d", "mechanikThema": "Neujahrsvorsätze", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}	{"id": "cmc32p2hg0001cha1batcc96k", "voe": null, "flag": false, "idee": "Fitness-Challenge für Mitarbeiter", "bezug": "Neujahr 2024", "monat": "2024-01", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "mehrwert": "Gesundheitstipps für den Start", "createdAt": "2025-06-19T07:42:05.523Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-06-19T07:42:05.523Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Intranet + Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "c3a27acb-fd41-4709-9347-e8de54a9429d", "mechanikThema": "Neujahrsvorsätze", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcrihi4q0009tkxj5kyp6m1g	cmbs216wu000m7u471io55pu8	monat	2024-01	August	cmbkufojh0000680ty85x3bu6	2025-07-06 10:10:34.633	UPDATE	Admin User	2025-07-06 10:10:34.634	{"id": "cmbs216wu000m7u471io55pu8", "voe": null, "flag": false, "idee": "Fitness-Challenge für Mitarbeiter", "bezug": "Neujahr 2024", "monat": "August", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Gesundheitstipps für den Start", "createdAt": "2025-06-11T14:38:03.582Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:10:34.627Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Intranet + Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "c3a27acb-fd41-4709-9347-e8de54a9429d", "mechanikThema": "Neujahrsvorsätze", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}	{"id": "cmbs216wu000m7u471io55pu8", "voe": null, "flag": false, "idee": "Fitness-Challenge für Mitarbeiter", "bezug": "Neujahr 2024", "monat": "2024-01", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "mehrwert": "Gesundheitstipps für den Start", "createdAt": "2025-06-11T14:38:03.582Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-06-11T14:38:03.582Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Intranet + Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "c3a27acb-fd41-4709-9347-e8de54a9429d", "mechanikThema": "Neujahrsvorsätze", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcrihmw6000btkxjfewjm4uu	cmbrm3u6l000513gckrw1z3gf	monat	2024-01	August	cmbkufojh0000680ty85x3bu6	2025-07-06 10:10:40.805	UPDATE	Admin User	2025-07-06 10:10:40.806	{"id": "cmbrm3u6l000513gckrw1z3gf", "voe": null, "flag": false, "idee": "Fitness-Challenge für Mitarbeiter", "bezug": "Neujahr 2024", "monat": "August", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Gesundheitstipps für den Start", "createdAt": "2025-06-11T07:12:13.197Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:10:40.800Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Intranet + Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "c3a27acb-fd41-4709-9347-e8de54a9429d", "mechanikThema": "Neujahrsvorsätze", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}	{"id": "cmbrm3u6l000513gckrw1z3gf", "voe": null, "flag": false, "idee": "Fitness-Challenge für Mitarbeiter", "bezug": "Neujahr 2024", "monat": "2024-01", "notes": null, "action": null, "status": "DRAFT", "voeDate": null, "mehrwert": "Gesundheitstipps für den Start", "createdAt": "2025-06-11T07:12:13.197Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-06-11T07:12:13.197Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "", "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Intranet + Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "c3a27acb-fd41-4709-9347-e8de54a9429d", "mechanikThema": "Neujahrsvorsätze", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcrihtm4000dtkxjr0jv767h	cmbrgt47k000boq3nilh5jjar	monat	2024-01	August	cmbkufojh0000680ty85x3bu6	2025-07-06 10:10:49.515	UPDATE	Admin User	2025-07-06 10:10:49.516	{"id": "cmbrgt47k000boq3nilh5jjar", "voe": null, "flag": false, "idee": "Fitness-Challenge für Mitarbeiter", "bezug": "Neujahr 2024", "monat": "August", "notes": null, "action": null, "status": "REVIEW", "voeDate": null, "location": {"id": "cmbkufomt0004680tx8c7wjrw", "name": "Hamburg Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.573Z", "updatedAt": "2025-06-06T13:30:59.573Z"}, "mehrwert": "Gesundheitstipps für den Start", "createdAt": "2025-06-11T04:43:54.896Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:10:49.512Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomt0004680tx8c7wjrw", "zusatzinfo": null, "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Intranet + Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "c3a27acb-fd41-4709-9347-e8de54a9429d", "mechanikThema": "Neujahrsvorsätze", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}	{"id": "cmbrgt47k000boq3nilh5jjar", "voe": null, "flag": false, "idee": "Fitness-Challenge für Mitarbeiter", "bezug": "Neujahr 2024", "monat": "2024-01", "notes": null, "action": null, "status": "REVIEW", "voeDate": null, "mehrwert": "Gesundheitstipps für den Start", "createdAt": "2025-06-11T04:43:54.896Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-06-11T06:50:59.074Z", "locationId": "cmbkufomt0004680tx8c7wjrw", "zusatzinfo": null, "copyExample": null, "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Intranet + Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "c3a27acb-fd41-4709-9347-e8de54a9429d", "mechanikThema": "Neujahrsvorsätze", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": null, "creativeBriefingExample": null, "firstCommentForEngagement": null}
cmcrij44t000htkxj3zbd7ajn	cmbopksp30013pptritd9jnfx	bezug	Weihnachten	Weihnachten Test	cmbkufojh0000680ty85x3bu6	2025-07-06 10:11:49.804	UPDATE	Admin User	2025-07-06 10:11:49.805	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-23T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten Test", "monat": "Dezember", "notes": "46as", "action": "57", "status": "APPROVED", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:11:49.799Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-23T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46as", "action": "57", "status": "IN_PROGRESS", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:05:46.231Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}
cmcrij44y000jtkxjohkc4two	cmbopksp30013pptritd9jnfx	status	IN_PROGRESS	APPROVED	cmbkufojh0000680ty85x3bu6	2025-07-06 10:11:49.81	UPDATE	Admin User	2025-07-06 10:11:49.811	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-23T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten Test", "monat": "Dezember", "notes": "46as", "action": "57", "status": "APPROVED", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:11:49.799Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}	{"id": "cmbopksp30013pptritd9jnfx", "voe": "2025-12-23T00:00:00.000Z", "flag": false, "idee": "Gewinne ein romantisches Dinner für 2", "bezug": "Weihnachten", "monat": "Dezember", "notes": "46as", "action": "57", "status": "IN_PROGRESS", "voeDate": null, "mehrwert": "Romantische Geschenkideen", "createdAt": "2025-06-09T06:26:04.743Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:05:46.231Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.AS", "copyExample": "436asA", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Website, Newsletter", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "cmbopksoq000vpptrp8synmy3", "mechanikThema": "Gewinnspiel", "creativeFormat": "77", "implementationLevel": "66", "copyExampleCustomized": "436", "creativeBriefingExample": "ewtaS", "firstCommentForEngagement": "46"}
cmcrjranw0001n6dtryskpahb	cmcq385xy0004e7cae55qgcgk	status	DRAFT	APPROVED	cmbkufojh0000680ty85x3bu6	2025-07-06 10:46:11.131	UPDATE	Admin User	2025-07-06 10:46:11.132	{"id": "cmcq385xy0004e7cae55qgcgk", "voe": "2025-07-04T00:00:00.000Z", "flag": false, "idee": "Osterdeko selbst gemacht - 3 einfache Ideen", "bezug": "Saisonal", "monat": "Februar", "notes": "erg", "action": "4757", "status": "APPROVED", "voeDate": null, "location": {"id": "cmbkufomt0004680tx8c7wjrw", "name": "Hamburg Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.573Z", "updatedAt": "2025-06-06T13:30:59.573Z"}, "mehrwert": "Familienzeit und Traditionen", "createdAt": "2025-07-05T10:15:38.518Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:46:11.122Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomt0004680tx8c7wjrw", "zusatzinfo": "", "copyExample": "6544575", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Instagram", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "cmbopksow000zpptr3shuqx0c", "mechanikThema": "DIY-Anleitung Test", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": "ewfer", "creativeBriefingExample": "4646", "firstCommentForEngagement": "rgert"}	{"id": "cmcq385xy0004e7cae55qgcgk", "voe": "2025-07-04T00:00:00.000Z", "flag": false, "idee": "Osterdeko selbst gemacht - 3 einfache Ideen", "bezug": "Saisonal", "monat": "Februar", "notes": "erg", "action": "4757", "status": "DRAFT", "voeDate": null, "mehrwert": "Familienzeit und Traditionen", "createdAt": "2025-07-05T10:15:38.518Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-05T12:16:24.989Z", "locationId": "cmbkufomt0004680tx8c7wjrw", "zusatzinfo": "", "copyExample": "6544575", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Instagram", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "cmbopksow000zpptr3shuqx0c", "mechanikThema": "DIY-Anleitung Test", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": "ewfer", "creativeBriefingExample": "4646", "firstCommentForEngagement": "rgert"}
cmcrjrmh90006n6dtc5dbn5d9	cmcq385xy0004e7cae55qgcgk	status	APPROVED	COMPLETED	cmbkufojh0000680ty85x3bu6	2025-07-06 10:46:26.445	UPDATE	Admin User	2025-07-06 10:46:26.446	{"id": "cmcq385xy0004e7cae55qgcgk", "voe": "2025-07-04T00:00:00.000Z", "flag": false, "idee": "Osterdeko selbst gemacht - 3 einfache Ideen", "bezug": "Saisonal", "monat": "Februar", "notes": "erg", "action": "4757", "status": "COMPLETED", "voeDate": null, "mehrwert": "Familienzeit und Traditionen", "createdAt": "2025-07-05T10:15:38.518Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:46:26.444Z", "locationId": "cmbkufomt0004680tx8c7wjrw", "zusatzinfo": "", "copyExample": "6544575", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Instagram", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "cmbopksow000zpptr3shuqx0c", "mechanikThema": "DIY-Anleitung Test", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": "ewfer", "creativeBriefingExample": "4646", "firstCommentForEngagement": "rgert"}	{"id": "cmcq385xy0004e7cae55qgcgk", "voe": "2025-07-04T00:00:00.000Z", "flag": false, "idee": "Osterdeko selbst gemacht - 3 einfache Ideen", "bezug": "Saisonal", "monat": "Februar", "notes": "erg", "action": "4757", "status": "APPROVED", "voeDate": null, "mehrwert": "Familienzeit und Traditionen", "createdAt": "2025-07-05T10:15:38.518Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T10:46:11.122Z", "locationId": "cmbkufomt0004680tx8c7wjrw", "zusatzinfo": "", "copyExample": "6544575", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Instagram", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "cmbopksow000zpptr3shuqx0c", "mechanikThema": "DIY-Anleitung Test", "creativeFormat": null, "implementationLevel": null, "copyExampleCustomized": "ewfer", "creativeBriefingExample": "4646", "firstCommentForEngagement": "rgert"}
cmcrkq9if00033ezo796585wz	cmcqbis5r000bybee6trm0ykq	status	IN_PROGRESS	APPROVED	cmbkufojh0000680ty85x3bu6	2025-07-06 11:13:22.599	UPDATE	Admin User	2025-07-06 11:13:22.6	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-09-03T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "zerzerzer", "action": "dsf", "status": "APPROVED", "voeDate": null, "location": {"id": "cmbkufomo0003680tr7qxxejw", "name": "Berlin Office", "status": "ACTIVE", "createdAt": "2025-06-06T13:30:59.569Z", "updatedAt": "2025-06-06T13:30:59.569Z"}, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "createdBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T11:13:22.592Z", "updatedBy": {"id": "cmbkufojh0000680ty85x3bu6", "name": "Admin User", "email": "admin@example.com"}, "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "ertrezrez", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "ertzerzre"}	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-09-03T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "zerzerzer", "action": "dsf", "status": "IN_PROGRESS", "voeDate": null, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T09:57:27.452Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "ertrezrez", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "ertzerzre"}
cmcrkwhs100083ezoe7fgqsti	cmcqbis5r000bybee6trm0ykq	status	APPROVED	COMPLETED	cmbkufojh0000680ty85x3bu6	2025-07-06 11:18:13.249	UPDATE	Admin User	2025-07-06 11:18:13.25	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-09-03T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "zerzerzer", "action": "dsf", "status": "COMPLETED", "voeDate": null, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T11:18:13.248Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "ertrezrez", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "ertzerzre"}	{"id": "cmcqbis5r000bybee6trm0ykq", "voe": "2025-09-03T00:00:00.000Z", "flag": false, "idee": "Kostümwettbewerb im Büro", "bezug": "Vielfalt", "monat": "Januar", "notes": "zerzerzer", "action": "dsf", "status": "APPROVED", "voeDate": null, "mehrwert": "Teambuilding", "createdAt": "2025-07-05T14:07:50.799Z", "deletedAt": null, "gptResult": null, "n8nResult": null, "updatedAt": "2025-07-06T11:13:22.592Z", "locationId": "cmbkufomo0003680tr7qxxejw", "zusatzinfo": "ertrezrez", "copyExample": "dfs", "createdById": "cmbkufojh0000680ty85x3bu6", "deletedById": null, "platzierung": "Facebook", "updatedById": "cmbkufojh0000680ty85x3bu6", "contentPlanId": "fd27e060-d07b-42b5-84f8-ee8f01d92077", "mechanikThema": "Kreativität", "creativeFormat": "f", "implementationLevel": "wr", "copyExampleCustomized": "dsf", "creativeBriefingExample": "sdf", "firstCommentForEngagement": "ertzerzre"}
cmcs38dpn000wszt81h16un1a	cmcs38dpf000uszt8k65vz13a	created	\N	Neuer InputPlan erstellt	cmbkufojh0000680ty85x3bu6	2025-07-06 19:51:20.94	UPDATE	System	2025-07-06 19:51:20.94	\N	\N
\.


--
-- Data for Name: Location; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Location" (id, name, status, "createdAt", "updatedAt") FROM stdin;
cmbkufomo0003680tr7qxxejw	Berlin Office	ACTIVE	2025-06-06 13:30:59.569	2025-06-06 13:30:59.569
cmbkufomt0004680tx8c7wjrw	Hamburg Office	ACTIVE	2025-06-06 13:30:59.573	2025-06-06 13:30:59.573
cmbkufomw0005680typj69ozu	Social Media	ACTIVE	2025-06-06 13:30:59.576	2025-06-06 13:30:59.576
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Permission" (id, name, "userLocationId", description) FROM stdin;
cmbkugpcd000dsmqz7icxk2xb	manage_all	cmbkufon00007680t6jnn4fap	\N
cmbkugpci000fsmqza4n5916v	create_content	cmbkufon00007680t6jnn4fap	\N
cmbkugpcl000hsmqz8ihppp3t	edit_content	cmbkufon00007680t6jnn4fap	\N
cmbkugpco000jsmqzuu5oiply	delete_content	cmbkufon00007680t6jnn4fap	\N
cmbkugpcr000lsmqzlixo25gu	publish_content	cmbkufon00007680t6jnn4fap	\N
cmbkugpd2000rsmqzvu6gmcqx	view_content	cmbkugpcv000nsmqz4a1xzyje	\N
cmbopkspc0017pptr2o5qejtp	content.approve	cmbkufon00007680t6jnn4fap	\N
\.


--
-- Data for Name: RedakPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RedakPlan" (id, "inputPlanId", monat, bezug, "mechanikThema", idee, platzierung, voe, status, publiziert, "locationId", "createdById", "updatedById", "createdAt", "updatedAt") FROM stdin;
cmbkugpdw0015smqzpx6chtx8	cmbkugpdo0011smqzcmkf1cgx	2025-01	Neujahr	Social Media Kampagne	10 Tipps für einen gesunden Start ins neue Jahr	Instagram, Facebook	2025-01-02 00:00:00	COMPLETED	t	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.205	2025-06-06 13:31:47.205
cmbkwxdvm0007ovh67ouvf0uu	cmbkugpdt0013smqzlnpgr5kt	2025-02	Valentinstag	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-02-07 00:00:00	IN_PROGRESS	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 14:40:44.674	2025-06-06 14:40:44.674
cmbopksp60015pptrzgrsqu7k	cmbopksoz0011pptr0sy8aijx	2025-01	Neujahr	Social Media Kampagne	10 Tipps für einen gesunden Start ins neue Jahr	Instagram, Facebook	2025-01-02 00:00:00	COMPLETED	t	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-09 06:26:04.746	2025-06-09 06:26:04.746
cmbz8jtz8000287wxn0zdjpb7	cmbs1fdub000b7u47ujshfnzv	Juni	Vielfalt	Nachhaltigkeit	Green Office Initiative	FB + IG	2025-06-18 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-16 15:14:54.212	2025-06-16 15:14:54.212
cmbz8kv9f000587wx6v32dqj9	cmbs1fdub000b7u47ujshfnzv	Juni	Vielfalt	Nachhaltigkeit	Green Office Initiative	FB + IG	2025-06-19 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-16 15:15:42.531	2025-06-16 15:15:42.531
cmbz8lol5000987wxrv7ef2pv	cmbrfxjl00004oq3nwyvxpynd	Februar	Vielfalt	DIY-Anleitung	Osterdeko selbst gemacht - 3 einfache Ideen	FB + IG	2025-06-18 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-16 15:16:20.538	2025-06-16 15:16:20.538
cmbz8q27n000b87wx0fpbbcrt	cmbs1fdub000b7u47ujshfnzv	Juni	Vielfalt	Nachhaltigkeit	Green Office Initiative	FB + IG	2025-06-19 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-16 15:19:44.819	2025-06-16 15:19:44.819
cmcq38fj20007e7caayib2sry	cmbrfxjl00004oq3nwyvxpynd	Februar	Vielfalt	DIY-Anleitung	Osterdeko selbst gemacht - 3 einfache Ideen	FB + IG	2025-06-18 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-05 10:15:50.942	2025-07-05 10:15:50.942
cmcq59pjm0007wc2782pj9652	cmcq58wiy0002wc27prr1j86g	Juli	Saisonal	Summer Vibes  – Fokusthema	Wir spielen Sommer Memory mit den Besuchenden im Center.	Facebook	2025-07-02 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-05 11:12:49.81	2025-07-05 11:12:49.81
cmcqbgzij0003ybeegf3mrw65	cmbrfwwrj0001oq3nh5xhl6nw	2024-04	Ostern	Familienfreundlichkeit	Oster-Event für Mitarbeiterkinder	Newsletter + Flyer	2025-07-17 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-05 14:06:27.019	2025-07-05 14:06:27.019
cmcqbh8e50005ybee5gm7y0cd	cmbrfwwrj0001oq3nh5xhl6nw	2024-04	Ostern	Familienfreundlichkeit	Oster-Event für Mitarbeiterkinder	Newsletter + Flyer	2025-07-17 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-05 14:06:38.525	2025-07-05 14:06:38.525
cmcqbj89r000gybeef2di394q	cmbrfwwrj0001oq3nh5xhl6nw	2024-04	Ostern	Familienfreundlichkeit	Oster-Event für Mitarbeiterkinder	Newsletter + Flyer	2025-07-17 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-05 14:08:11.68	2025-07-05 14:08:11.68
cmcqbkukp000kybeea6gcfwrt	cmbopksp30013pptritd9jnfx	2025-02	Valentinstag	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-02-07 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-05 14:09:27.242	2025-07-05 14:09:27.242
cmcqbm6d9000mybeeofo8zhrb	cmbopksp30013pptritd9jnfx	2025-02	Valentinstag	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-02-07 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-05 14:10:29.182	2025-07-05 14:10:29.182
cmcqbt8y4000qybeej6zfixff	cmbrfwwrj0001oq3nh5xhl6nw	2024-04	Ostern	Familienfreundlichkeit	Oster-Event für Mitarbeiterkinder	Newsletter + Flyer	2025-07-17 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-05 14:15:59.117	2025-07-05 14:15:59.117
cmcqc39gq0014ybeep7qjkbc1	cmbopksp30013pptritd9jnfx	2025-02	Valentinstag	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-02-07 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-05 14:23:46.346	2025-07-05 14:23:46.346
cmcqbst3b000oybee0lg1kvpi	cmbopksp30013pptritd9jnfx	Oktober	Valentinstag	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-02-07 00:00:00	APPROVED	t	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-07-05 14:15:38.567	2025-07-05 14:25:35.874
cmcqc659f0016ybeef3v1n432	cmbopksp30013pptritd9jnfx	2025-02	Valentinstag	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-02-07 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-05 14:26:00.867	2025-07-05 14:26:00.867
cmcqce3r70018ybeenjojdp0v	cmbopksp30013pptritd9jnfx	2025-02	Valentinstag	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-02-07 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-05 14:32:12.164	2025-07-05 14:32:12.164
cmcqdizul0001sq41b0zwjqxn	cmbopksp30013pptritd9jnfx	2025-02	Valentinstag	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-02-07 00:00:00	IN_PROGRESS	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-05 15:03:59.997	2025-07-05 15:03:59.997
cmcrb8lyx0001szh2z5c0ojzv	cmbopksp30013pptritd9jnfx	2025-02	Valentinstag	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-02-07 00:00:00	IN_PROGRESS	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-06 06:47:42.393	2025-07-06 06:47:42.393
cmcrbb90m0003szh2qntdy9sp	cmbopksp30013pptritd9jnfx	2025-02	Valentinstag	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-02-07 00:00:00	IN_PROGRESS	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-06 06:49:45.574	2025-07-06 06:49:45.574
cmcrii04l000ftkxjalwytub7	cmbrfwwrj0001oq3nh5xhl6nw	August	Ostern	Familienfreundlichkeit	Oster-Event für Mitarbeiterkinder	Newsletter + Flyer	2025-07-17 00:00:00	IN_PROGRESS	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-06 10:10:57.957	2025-07-06 10:10:57.957
cmcrijebs000ltkxj68smp93o	cmbopksp30013pptritd9jnfx	Dezember	Weihnachten Test	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-12-23 00:00:00	IN_PROGRESS	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-06 10:12:03.016	2025-07-06 10:12:03.016
cmcrir4m60001k9a26o2r2rre	cmbopksp30013pptritd9jnfx	Dezember	Weihnachten Test	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-12-23 00:00:00	IN_PROGRESS	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-06 10:18:03.678	2025-07-06 10:18:03.678
cmcrj0rf00001rnon1cmhfrb8	cmbopksp30013pptritd9jnfx	Dezember	Weihnachten Test	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	2025-12-23 00:00:00	IN_PROGRESS	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-07-06 10:25:33.132	2025-07-06 10:25:33.132
cmcrjrmh60004n6dt1t1kc9qx	cmcq385xy0004e7cae55qgcgk	Februar	Saisonal	DIY-Anleitung Test	Osterdeko selbst gemacht - 3 einfache Ideen	Instagram	2025-07-04 00:00:00	DRAFT	f	cmbkufomt0004680tx8c7wjrw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-07-06 10:46:26.442	2025-07-06 10:46:26.442
cmcrkwhry00063ezo4rx54661	cmcqbis5r000bybee6trm0ykq	Januar	Vielfalt	Kreativität	Kostümwettbewerb im Büro	Facebook	2025-09-03 00:00:00	DRAFT	f	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-07-06 11:18:13.246	2025-07-06 11:18:13.246
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, name, role, "createdAt", "updatedAt", "isActive") FROM stdin;
cmbkufokv0001680tkeor7ce5	user@example.com	$2a$10$LIio5s1iv.L.lyW87Aezp.FWwcwsFOX3xCYP9UiCpUu3WnrokDcvG	Test User	USER	2025-06-06 13:30:59.503	2025-06-06 13:30:59.503	t
cmbkufomk0002680t53b5dske	demo@example.com	$2a$10$BPIMvrqDKaPj4yS3eFKxmuwkZReXVmOvSK.RUGNM8ymdkLFsUlxNe	Demo User	USER	2025-06-06 13:30:59.565	2025-06-06 13:30:59.565	t
cmbkufojh0000680ty85x3bu6	admin@example.com	$2a$10$DJk03IntjCaiqCn3QTCGJuTFI8UNTvnGiQ/w9/620ziMlnwRo9l6i	Admin User	ADMIN	2025-06-06 13:30:59.453	2025-06-09 06:26:04.604	t
\.


--
-- Data for Name: UserLocation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserLocation" (id, "userId", "locationId") FROM stdin;
cmbkufon00007680t6jnn4fap	cmbkufojh0000680ty85x3bu6	cmbkufomo0003680tr7qxxejw
cmbkugpcv000nsmqz4a1xzyje	cmbkufokv0001680tkeor7ce5	cmbkufomo0003680tr7qxxejw
7c6d6720-2ac4-4e71-bccc-d6fe4026114c	cmbkufojh0000680ty85x3bu6	cmbkufomt0004680tx8c7wjrw
9ae851e1-64c2-4638-b079-7b7332b2e07e	cmbkufojh0000680ty85x3bu6	cmbkufomw0005680typj69ozu
\.


--
-- Data for Name: UserLocationRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserLocationRole" (id, "userLocationId", "roleId") FROM stdin;
cmbkugpc9000bsmqziz76v9up	cmbkufon00007680t6jnn4fap	cmbkugpbw0006smqze4rduroy
cmbkugpcz000psmqzhprzrt17	cmbkugpcv000nsmqz4a1xzyje	cmbkugpc30007smqzfhc2e22a
\.


--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserRole" (id, name, description) FROM stdin;
cmbkugpbw0006smqze4rduroy	LOCATION_ADMIN	Administrator für einen Standort
cmbkugpc30007smqzfhc2e22a	LOCATION_USER	Normaler Benutzer für einen Standort
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
61e0ee97-1a11-475c-ba13-053ecd2f2ccd	bada351ef8f260371d52183cf537b90d27b39967c7a4d26b76a1b18f90988fbf	2025-06-17 18:18:50.383998+00	0_init		\N	2025-06-17 18:18:50.383998+00	0
\.


--
-- Name: ContentPlanHistory ContentPlanHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentPlanHistory"
    ADD CONSTRAINT "ContentPlanHistory_pkey" PRIMARY KEY (id);


--
-- Name: ContentPlan ContentPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentPlan"
    ADD CONSTRAINT "ContentPlan_pkey" PRIMARY KEY (id);


--
-- Name: InputPlanHistory InputPlanHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InputPlanHistory"
    ADD CONSTRAINT "InputPlanHistory_pkey" PRIMARY KEY (id);


--
-- Name: InputPlan InputPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InputPlan"
    ADD CONSTRAINT "InputPlan_pkey" PRIMARY KEY (id);


--
-- Name: Location Location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Location"
    ADD CONSTRAINT "Location_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: RedakPlan RedakPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RedakPlan"
    ADD CONSTRAINT "RedakPlan_pkey" PRIMARY KEY (id);


--
-- Name: UserLocationRole UserLocationRole_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserLocationRole"
    ADD CONSTRAINT "UserLocationRole_pkey" PRIMARY KEY (id);


--
-- Name: UserLocation UserLocation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserLocation"
    ADD CONSTRAINT "UserLocation_pkey" PRIMARY KEY (id);


--
-- Name: UserRole UserRole_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ContentPlanHistory_changedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ContentPlanHistory_changedAt_idx" ON public."ContentPlanHistory" USING btree ("changedAt");


--
-- Name: ContentPlanHistory_changedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ContentPlanHistory_changedById_idx" ON public."ContentPlanHistory" USING btree ("changedById");


--
-- Name: ContentPlanHistory_contentPlanId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ContentPlanHistory_contentPlanId_idx" ON public."ContentPlanHistory" USING btree ("contentPlanId");


--
-- Name: ContentPlan_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ContentPlan_createdById_idx" ON public."ContentPlan" USING btree ("createdById");


--
-- Name: ContentPlan_locationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ContentPlan_locationId_idx" ON public."ContentPlan" USING btree ("locationId");


--
-- Name: ContentPlan_statusChangedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ContentPlan_statusChangedById_idx" ON public."ContentPlan" USING btree ("statusChangedById");


--
-- Name: ContentPlan_updatedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ContentPlan_updatedById_idx" ON public."ContentPlan" USING btree ("updatedById");


--
-- Name: InputPlan_contentPlanId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InputPlan_contentPlanId_idx" ON public."InputPlan" USING btree ("contentPlanId");


--
-- Name: InputPlan_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InputPlan_createdById_idx" ON public."InputPlan" USING btree ("createdById");


--
-- Name: InputPlan_locationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InputPlan_locationId_idx" ON public."InputPlan" USING btree ("locationId");


--
-- Name: InputPlan_monat_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InputPlan_monat_idx" ON public."InputPlan" USING btree (monat);


--
-- Name: InputPlan_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InputPlan_status_idx" ON public."InputPlan" USING btree (status);


--
-- Name: InputPlan_updatedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InputPlan_updatedById_idx" ON public."InputPlan" USING btree ("updatedById");


--
-- Name: Location_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Location_name_key" ON public."Location" USING btree (name);


--
-- Name: Permission_userLocationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Permission_userLocationId_idx" ON public."Permission" USING btree ("userLocationId");


--
-- Name: Permission_userLocationId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Permission_userLocationId_name_key" ON public."Permission" USING btree ("userLocationId", name);


--
-- Name: RedakPlan_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RedakPlan_createdById_idx" ON public."RedakPlan" USING btree ("createdById");


--
-- Name: RedakPlan_inputPlanId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RedakPlan_inputPlanId_idx" ON public."RedakPlan" USING btree ("inputPlanId");


--
-- Name: RedakPlan_locationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RedakPlan_locationId_idx" ON public."RedakPlan" USING btree ("locationId");


--
-- Name: RedakPlan_monat_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RedakPlan_monat_idx" ON public."RedakPlan" USING btree (monat);


--
-- Name: RedakPlan_publiziert_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RedakPlan_publiziert_idx" ON public."RedakPlan" USING btree (publiziert);


--
-- Name: RedakPlan_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RedakPlan_status_idx" ON public."RedakPlan" USING btree (status);


--
-- Name: RedakPlan_updatedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RedakPlan_updatedById_idx" ON public."RedakPlan" USING btree ("updatedById");


--
-- Name: UserLocationRole_roleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "UserLocationRole_roleId_idx" ON public."UserLocationRole" USING btree ("roleId");


--
-- Name: UserLocationRole_userLocationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "UserLocationRole_userLocationId_idx" ON public."UserLocationRole" USING btree ("userLocationId");


--
-- Name: UserLocationRole_userLocationId_roleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserLocationRole_userLocationId_roleId_key" ON public."UserLocationRole" USING btree ("userLocationId", "roleId");


--
-- Name: UserLocation_locationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "UserLocation_locationId_idx" ON public."UserLocation" USING btree ("locationId");


--
-- Name: UserLocation_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "UserLocation_userId_idx" ON public."UserLocation" USING btree ("userId");


--
-- Name: UserLocation_userId_locationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserLocation_userId_locationId_key" ON public."UserLocation" USING btree ("userId", "locationId");


--
-- Name: UserRole_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserRole_name_key" ON public."UserRole" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: ContentPlanHistory ContentPlanHistory_changedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentPlanHistory"
    ADD CONSTRAINT "ContentPlanHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ContentPlanHistory ContentPlanHistory_contentPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentPlanHistory"
    ADD CONSTRAINT "ContentPlanHistory_contentPlanId_fkey" FOREIGN KEY ("contentPlanId") REFERENCES public."ContentPlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContentPlan ContentPlan_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentPlan"
    ADD CONSTRAINT "ContentPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ContentPlan ContentPlan_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentPlan"
    ADD CONSTRAINT "ContentPlan_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ContentPlan ContentPlan_statusChangedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentPlan"
    ADD CONSTRAINT "ContentPlan_statusChangedById_fkey" FOREIGN KEY ("statusChangedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContentPlan ContentPlan_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentPlan"
    ADD CONSTRAINT "ContentPlan_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InputPlanHistory InputPlanHistory_changedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InputPlanHistory"
    ADD CONSTRAINT "InputPlanHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InputPlanHistory InputPlanHistory_inputPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InputPlanHistory"
    ADD CONSTRAINT "InputPlanHistory_inputPlanId_fkey" FOREIGN KEY ("inputPlanId") REFERENCES public."InputPlan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InputPlan InputPlan_contentPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InputPlan"
    ADD CONSTRAINT "InputPlan_contentPlanId_fkey" FOREIGN KEY ("contentPlanId") REFERENCES public."ContentPlan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InputPlan InputPlan_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InputPlan"
    ADD CONSTRAINT "InputPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InputPlan InputPlan_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InputPlan"
    ADD CONSTRAINT "InputPlan_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InputPlan InputPlan_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InputPlan"
    ADD CONSTRAINT "InputPlan_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Permission Permission_userLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_userLocationId_fkey" FOREIGN KEY ("userLocationId") REFERENCES public."UserLocation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RedakPlan RedakPlan_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RedakPlan"
    ADD CONSTRAINT "RedakPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RedakPlan RedakPlan_inputPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RedakPlan"
    ADD CONSTRAINT "RedakPlan_inputPlanId_fkey" FOREIGN KEY ("inputPlanId") REFERENCES public."InputPlan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RedakPlan RedakPlan_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RedakPlan"
    ADD CONSTRAINT "RedakPlan_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RedakPlan RedakPlan_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RedakPlan"
    ADD CONSTRAINT "RedakPlan_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserLocationRole UserLocationRole_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserLocationRole"
    ADD CONSTRAINT "UserLocationRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."UserRole"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserLocationRole UserLocationRole_userLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserLocationRole"
    ADD CONSTRAINT "UserLocationRole_userLocationId_fkey" FOREIGN KEY ("userLocationId") REFERENCES public."UserLocation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserLocation UserLocation_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserLocation"
    ADD CONSTRAINT "UserLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserLocation UserLocation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserLocation"
    ADD CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT CREATE ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

