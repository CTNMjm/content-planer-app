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

--
-- Name: LocationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LocationStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."LocationStatus" OWNER TO postgres;

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
    month text,
    reference text,
    value_proposition text,
    mechanic_theme text,
    idea text,
    placement text,
    implementation_level text,
    format text,
    creative_briefing_example text,
    copy_example text,
    copy_example_customized text,
    first_comment_for_engagement text,
    notes text,
    n8n_result text,
    action text,
    flag boolean DEFAULT false,
    voe_date timestamp(3) without time zone,
    "implementationLevel" text,
    "creativeFormat" text,
    "creativeBriefingExample" text,
    "copyExample" text,
    "copyExampleCustomized" text,
    "firstCommentForEngagement" text,
    "n8nResult" text,
    "voeDate" timestamp(3) without time zone
);


ALTER TABLE public."InputPlan" OWNER TO postgres;

--
-- Name: InputPlanHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InputPlanHistory" (
    id text DEFAULT gen_random_uuid() NOT NULL,
    "inputPlanId" text NOT NULL,
    field text NOT NULL,
    "oldValue" text,
    "newValue" text,
    "changedById" text NOT NULL,
    "changedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
c3a27acb-fd41-4709-9347-e8de54a9429d	2024-01	Neujahr 2024	Gesundheitstipps für den Start	Neujahrsvorsätze	Fitness-Challenge für Mitarbeiter	Intranet + Newsletter	APPROVED	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-10 06:08:31.071	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
37248d57-3497-48f1-bcf6-35e59cafd3c4	2024-02	Valentinstag	Teamzusammenhalt stärken	Wertschätzung	Dankeschön-Aktion für Kollegen	Social Media + Plakate	IN_PROGRESS	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-10 06:08:31.071	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbkugpdf000vsmqzio900z9z	Februar	Vielfalt	Romantische Geschenkideen	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Facebook	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.188	2025-06-06 14:11:50.689	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbopksok000tpptr3d6c7svs	2025-01	Neujahr	Neujahrsvorsätze und gesunde Ernährung	Social Media Kampagne	10 Tipps für einen gesunden Start ins neue Jahr	Instagram, Facebook	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-09 06:26:04.724	2025-06-09 06:26:04.724	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b19f85af-c471-45a6-a5f4-fcafbb679fb3	2024-05	Tag der Arbeit	Mitarbeiteranerkennung	Erfolgsgeschichten	Mitarbeiter des Monats Feature	Intranet + Social Media	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-10 06:08:31.071	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
49b28e2f-dd37-4a3e-b359-fd2ff3aa0349	2024-06	Sommeranfang	Gesundheit am Arbeitsplatz	Sommerfitness	Bike-to-Work Challenge	App + Newsletter	IN_PROGRESS	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-10 06:08:31.071	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
49f16a8c-778d-4a1e-8f32-f38588d2e7c6	2024-07	Urlaubszeit	Erholung und Produktivität	Urlaubstipps	Vacation Sharing Platform	Intranet + Blog	DRAFT	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-10 06:08:31.071	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2a79279e-51fa-4f6e-a145-1713bb703520	2024-09	Herbstbeginn	Innovation fördern	Ideenwettbewerb	Innovation Challenge 2024	Alle Kanäle	IN_PROGRESS	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-10 06:08:31.071	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
fd27e060-d07b-42b5-84f8-ee8f01d92077	2024-10	Halloween	Teambuilding	Kreativität	Kostümwettbewerb im Büro	Social Media + Fotos	DRAFT	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-10 06:08:31.071	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6a9635a0-d093-4435-8862-6fb7fecea0e8	Januar	Vielfalt	Wissensvermittlung	Weiterbildung	Summer School Programm	Instagram	COMPLETED	cmbkufomt0004680tx8c7wjrw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-11 04:18:54.481	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbkugpdl000zsmqzjgtlloqr	Februar	Vielfalt	Familienzeit und Traditionen	DIY-Anleitung	Osterdeko selbst gemacht - 3 einfache Ideen	FB + IG	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.194	2025-06-11 04:19:28.281	test	test	test	test	test	tst	EINFACH	test	\N	\N
cmbopksow000zpptr3shuqx0c	Februar	Vielfalt	Familienzeit und Traditionen	DIY-Anleitung Test	Osterdeko selbst gemacht - 3 einfache Ideen	Instagram	IN_PROGRESS	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-09 06:26:04.736	2025-06-11 04:43:35.229	4757	6544575	\N	4646	\N	\N	\N	\N	\N	\N
cmbopksot000xpptr9j75qnz2	Juni	Saisonal	Frühjahrsputz und Organisation	Blog-Serie  2	5-teilige Serie: Ordnung schaffen mit System	TikTok + IG	COMPLETED	cmbkufomw0005680typj69ozu	cmbkufojh0000680ty85x3bu6	\N	2025-06-09 06:26:04.733	2025-06-10 15:18:51.902	test	test	test	test	test	test	MITTEL	Notizen Test	\N	\N
cmbopksoq000vpptrp8synmy3	2025-02	Valentinstag	Romantische Geschenkideen	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-09 06:26:04.73	2025-06-11 04:43:56.244	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6b72b02b-7c25-42f7-aabc-c95708486259	2024-04	Ostern	Work-Life-Balance	Familienfreundlichkeit	Oster-Event für Mitarbeiterkinder	Newsletter + Flyer	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-11 07:00:10.998	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbkugpdi000xsmqzkj7xne6p	März	Vielfalt	Frühjahrsputz und Organisation	Blog-Serie	5-teilige Serie: Ordnung schaffen mit System	Facebook	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.191	2025-06-11 07:12:14.56	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5a8b22f1-8d06-43c8-804d-9e1266088eff	Juni	Vielfalt	Motivation und Aufbruch	Nachhaltigkeit	Green Office Initiative	FB + IG	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufokv0001680tkeor7ce5	cmbkufokv0001680tkeor7ce5	2025-06-10 06:08:31.071	2025-06-11 14:21:07.85	ete	rez	erz	ete	\N	erz	EINFACH	\N	\N	\N
cmbkugpdb000tsmqzmqscakwd	Juni	Vielfalt	Neujahrsvorsätze und gesunde Ernährung	Social Media Kampagne	10 Tipps für einen gesunden Start ins neue Jahr	FB + IG	COMPLETED	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.184	2025-06-11 14:38:05.163	6587	56868	56868	587568	\N	868	\N	568	\N	\N
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
\.


--
-- Data for Name: InputPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InputPlan" (id, "contentPlanId", monat, bezug, mehrwert, "mechanikThema", idee, platzierung, status, voe, zusatzinfo, "gptResult", "locationId", "createdById", "updatedById", "createdAt", "updatedAt", month, reference, value_proposition, mechanic_theme, idea, placement, implementation_level, format, creative_briefing_example, copy_example, copy_example_customized, first_comment_for_engagement, notes, n8n_result, action, flag, voe_date, "implementationLevel", "creativeFormat", "creativeBriefingExample", "copyExample", "copyExampleCustomized", "firstCommentForEngagement", "n8nResult", "voeDate") FROM stdin;
cmbkugpdo0011smqzcmkf1cgx	cmbkugpdb000tsmqzmqscakwd	2025-01	Neujahr	Neujahrsvorsätze und gesunde Ernährung	Social Media Kampagne	10 Tipps für einen gesunden Start ins neue Jahr	Instagram, Facebook	COMPLETED	2025-01-02 00:00:00	Fokus auf praktische, umsetzbare Tipps. Zielgruppe: 25-45 Jahre	\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-06 13:31:47.197	2025-06-06 13:31:47.197	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbkvfkts0001ovh65i3wpvxv	cmbkugpdl000zsmqzjgtlloqr	Februar	Vielfalt	Familienzeit und Traditionen	DIY-Anleitung	Osterdeko selbst gemacht - 3 einfache Ideen	FB + IG	DRAFT	\N		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-06 13:58:54.257	2025-06-06 13:58:54.257	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbkvw7w10003ovh60g5wr0h6	cmbkugpdf000vsmqzio900z9z	Februar	Vielfalt	Romantische Geschenkideen	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Facebook	REVIEW	\N		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-06 14:11:50.641	2025-06-06 14:31:49.584	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbkugpdt0013smqzlnpgr5kt	cmbkugpdf000vsmqzio900z9z	2025-02	Valentinstag	Romantische Geschenkideen	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	COMPLETED	2025-02-07 00:00:00	Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.	\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-06 13:31:47.202	2025-06-06 14:40:44.823	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbopksoz0011pptr0sy8aijx	cmbopksok000tpptr3d6c7svs	2025-01	Neujahr	Neujahrsvorsätze und gesunde Ernährung	Social Media Kampagne	10 Tipps für einen gesunden Start ins neue Jahr	Instagram, Facebook	COMPLETED	2025-01-02 00:00:00	Fokus auf praktische, umsetzbare Tipps. Zielgruppe: 25-45 Jahre	\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	\N	2025-06-09 06:26:04.739	2025-06-09 06:26:04.739	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbrfwwrj0001oq3nh5xhl6nw	6b72b02b-7c25-42f7-aabc-c95708486259	2024-04	Ostern	Work-Life-Balance	Familienfreundlichkeit	Oster-Event für Mitarbeiterkinder	Newsletter + Flyer	DRAFT	\N		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 04:18:52.253	2025-06-11 04:18:52.253	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbrgt47k000boq3nilh5jjar	c3a27acb-fd41-4709-9347-e8de54a9429d	2024-01	Neujahr 2024	Gesundheitstipps für den Start	Neujahrsvorsätze	Fitness-Challenge für Mitarbeiter	Intranet + Newsletter	REVIEW	\N	\N	\N	cmbkufomt0004680tx8c7wjrw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 04:43:54.896	2025-06-11 06:50:59.074	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbrlo8va000113gc6133g9ti	6b72b02b-7c25-42f7-aabc-c95708486259	2024-04	Ostern	Work-Life-Balance	Familienfreundlichkeit	Oster-Event für Mitarbeiterkinder	Newsletter + Flyer	DRAFT	\N		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 07:00:05.735	2025-06-11 07:00:05.735	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbrm3u6l000513gckrw1z3gf	c3a27acb-fd41-4709-9347-e8de54a9429d	2024-01	Neujahr 2024	Gesundheitstipps für den Start	Neujahrsvorsätze	Fitness-Challenge für Mitarbeiter	Intranet + Newsletter	DRAFT	\N		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 07:12:13.197	2025-06-11 07:12:13.197	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbs216wu000m7u471io55pu8	c3a27acb-fd41-4709-9347-e8de54a9429d	2024-01	Neujahr 2024	Gesundheitstipps für den Start	Neujahrsvorsätze	Fitness-Challenge für Mitarbeiter	Intranet + Newsletter	DRAFT	\N		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 14:38:03.582	2025-06-11 14:38:03.582	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbopksp30013pptritd9jnfx	cmbopksoq000vpptrp8synmy3	2025-02	Valentinstag	Romantische Geschenkideen	Gewinnspiel	Gewinne ein romantisches Dinner für 2	Website, Newsletter	REVIEW	2025-02-07 00:00:00	Kooperation mit lokalem Restaurant. Teilnahmebedingungen klären.	\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-09 06:26:04.743	2025-06-11 14:47:15.396	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmbrfxjl00004oq3nwyvxpynd	cmbkugpdl000zsmqzjgtlloqr	Februar	Vielfalt	Familienzeit und Traditionen	DIY-Anleitung	Osterdeko selbst gemacht - 3 einfache Ideen	FB + IG	APPROVED	2025-06-18 00:00:00		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 04:19:21.828	2025-06-16 15:16:17.843	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	test	\N	test	f	\N	EINFACH	test	test	test	test	tst	\N	\N
cmbs1fdub000b7u47ujshfnzv	5a8b22f1-8d06-43c8-804d-9e1266088eff	Juni	Vielfalt	Motivation und Aufbruch	Nachhaltigkeit	Green Office Initiative	FB + IG	COMPLETED	2025-06-19 00:00:00		\N	cmbkufomo0003680tr7qxxejw	cmbkufojh0000680ty85x3bu6	cmbkufojh0000680ty85x3bu6	2025-06-11 14:21:06.131	2025-06-16 15:19:44.932	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ete	f	\N	EINFACH	\N	ete	rez	erz	erz	\N	\N
\.


--
-- Data for Name: InputPlanHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InputPlanHistory" (id, "inputPlanId", field, "oldValue", "newValue", "changedById", "changedAt") FROM stdin;
9c5973b2-96a5-4a7c-9f89-c598f7f9eacb	cmbrlo8va000113gc6133g9ti	created	\N	Neuer InputPlan erstellt	cmbkufojh0000680ty85x3bu6	2025-06-11 07:00:05.739
713b5039-5bd3-4c70-b097-ed92c204a397	cmbrm3u6l000513gckrw1z3gf	created	\N	Neuer InputPlan erstellt	cmbkufojh0000680ty85x3bu6	2025-06-11 07:12:13.202
91426338-3fb8-4d8e-b7dd-235813fc471d	cmbs1fdub000b7u47ujshfnzv	created	\N	Neuer InputPlan erstellt	cmbkufojh0000680ty85x3bu6	2025-06-11 14:21:06.137
dff54948-b68a-4c12-961c-2db354070f80	cmbs216wu000m7u471io55pu8	created	\N	Neuer InputPlan erstellt	cmbkufojh0000680ty85x3bu6	2025-06-11 14:38:03.587
9cecd0da-19d8-4154-877c-505e7e6f9ae2	cmbs1fdub000b7u47ujshfnzv	voe	Wed Jun 18 2025 02:00:00 GMT+0200 (Central European Summer Time)	2025-06-19T00:00:00.000Z	cmbkufojh0000680ty85x3bu6	2025-06-16 15:15:37.749
ff1fe278-064a-4f07-b867-5283f735131e	cmbrfxjl00004oq3nwyvxpynd	voe		2025-06-18T00:00:00.000Z	cmbkufojh0000680ty85x3bu6	2025-06-16 15:16:14.552
8d1ad081-36c3-47a9-945e-5ac0c6f8228f	cmbrfxjl00004oq3nwyvxpynd	status	DRAFT	APPROVED	cmbkufojh0000680ty85x3bu6	2025-06-16 15:16:17.849
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
-- Name: InputPlanHistory_changedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InputPlanHistory_changedAt_idx" ON public."InputPlanHistory" USING btree ("changedAt");


--
-- Name: InputPlanHistory_inputPlanId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "InputPlanHistory_inputPlanId_idx" ON public."InputPlanHistory" USING btree ("inputPlanId");


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
    ADD CONSTRAINT "InputPlanHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES public."User"(id) ON DELETE RESTRICT;


--
-- Name: InputPlanHistory InputPlanHistory_inputPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InputPlanHistory"
    ADD CONSTRAINT "InputPlanHistory_inputPlanId_fkey" FOREIGN KEY ("inputPlanId") REFERENCES public."InputPlan"(id) ON DELETE CASCADE;


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

