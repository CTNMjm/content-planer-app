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

