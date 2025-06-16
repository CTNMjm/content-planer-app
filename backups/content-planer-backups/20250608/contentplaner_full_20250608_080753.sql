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
    "createdById" text,
    "updatedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ContentPlan" OWNER TO postgres;

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
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InputPlan" OWNER TO postgres;

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
    "userLocationId" text NOT NULL
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
    "updatedAt" timestamp(3) without time zone NOT NULL
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
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, name, role, "createdAt", "updatedAt") FROM stdin;
cmbkufokv0001680tkeor7ce5	user@example.com	$2a$10$LIio5s1iv.L.lyW87Aezp.FWwcwsFOX3xCYP9UiCpUu3WnrokDcvG	Test User	USER	2025-06-06 13:30:59.503	2025-06-06 13:30:59.503
cmbkufomk0002680t53b5dske	demo@example.com	$2a$10$BPIMvrqDKaPj4yS3eFKxmuwkZReXVmOvSK.RUGNM8ymdkLFsUlxNe	Demo User	USER	2025-06-06 13:30:59.565	2025-06-06 13:30:59.565
cmbkufojh0000680ty85x3bu6	admin@example.com	$2a$10$DJk03IntjCaiqCn3QTCGJuTFI8UNTvnGiQ/w9/620ziMlnwRo9l6i	Admin User	ADMIN	2025-06-06 13:30:59.453	2025-06-06 13:31:47.025
\.


--
-- Data for Name: UserLocation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserLocation" (id, "userId", "locationId") FROM stdin;
cmbkufon00007680t6jnn4fap	cmbkufojh0000680ty85x3bu6	cmbkufomo0003680tr7qxxejw
cmbkugpcv000nsmqz4a1xzyje	cmbkufokv0001680tkeor7ce5	cmbkufomo0003680tr7qxxejw
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
-- Name: ContentPlan ContentPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentPlan"
    ADD CONSTRAINT "ContentPlan_pkey" PRIMARY KEY (id);


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
-- Name: ContentPlan_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ContentPlan_createdById_idx" ON public."ContentPlan" USING btree ("createdById");


--
-- Name: ContentPlan_locationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ContentPlan_locationId_idx" ON public."ContentPlan" USING btree ("locationId");


--
-- Name: ContentPlan_monat_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ContentPlan_monat_idx" ON public."ContentPlan" USING btree (monat);


--
-- Name: ContentPlan_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ContentPlan_status_idx" ON public."ContentPlan" USING btree (status);


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
-- Name: ContentPlan ContentPlan_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentPlan"
    ADD CONSTRAINT "ContentPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ContentPlan ContentPlan_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentPlan"
    ADD CONSTRAINT "ContentPlan_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public."Location"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ContentPlan ContentPlan_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ContentPlan"
    ADD CONSTRAINT "ContentPlan_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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


--
-- PostgreSQL database dump complete
--

