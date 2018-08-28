--
-- PostgreSQL database dump
--

-- Dumped from database version 10.3 (Ubuntu 10.3-1.pgdg14.04+1)
-- Dumped by pg_dump version 10.3 (Ubuntu 10.3-1.pgdg14.04+1)

-- Started on 2018-07-10 14:26:20 -04

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 12959)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2938 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- TOC entry 526 (class 1247 OID 24579)
-- Name: reservasaux; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reservasaux AS (
	objeto integer,
	data integer,
	mat_aula_1 integer,
	mat_aula_2 integer,
	mat_aula_3 integer,
	mat_aula_4 integer,
	almoco integer,
	vesp_aula_1 integer,
	vesp_aula_2 integer,
	vesp_aula_3 integer,
	vesp_aula_4 integer,
	janta integer,
	not_aula_1 integer,
	not_aula_2 integer,
	not_aula_3 integer,
	not_aula_4 integer,
	descricao character varying
);


ALTER TYPE public.reservasaux OWNER TO postgres;

--
-- TOC entry 228 (class 1255 OID 24580)
-- Name: obter_reservas(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.obter_reservas(integer) RETURNS SETOF public.reservasaux
    LANGUAGE plpgsql
    AS $_$
DECLARE
    _linhaOBJ objetos%rowtype;
    _linhaRES reservasAUX%rowtype;
    _linhaRES_new reservasAUX%rowtype;
    _nop int;
BEGIN
-- $1 data da reserva
    FOR _linhaOBJ IN SELECT * FROM objetos order by descricao
       LOOP
   	     _nop:= 0;
		   FOR _linhaRES IN 
			SELECT res.objeto,
				res.data,
				    max(res.mat_aula_1::integer) AS mat_aula_1,
				    max(res.mat_aula_2::integer) AS mat_aula_2,
				    max(res.mat_aula_3::integer) AS mat_aula_3,
				    max(res.mat_aula_4::integer) AS mat_aula_4,
				    max(res.almoco::integer) AS almoco,
				    max(res.vesp_aula_1::integer) AS vesp_aula_1,
				    max(res.vesp_aula_2::integer) AS vesp_aula_2,
				    max(res.vesp_aula_3::integer) AS vesp_aula_3,
				    max(res.vesp_aula_4::integer) AS vesp_aula_4,
				    max(res.janta::integer) AS janta,
				    max(res.not_aula_1::integer) AS not_aula_1,
				    max(res.not_aula_2::integer) AS not_aula_2,
				    max(res.not_aula_3::integer) AS not_aula_3,
				    max(res.not_aula_4::integer) AS not_aula_4
		   FROM reservas res 
		   INNER JOIN operacoes op ON op.id = res.operacao
		   WHERE (res.data = $1 AND res.objeto = _linhaOBJ.id AND op.ativo = true) 
		   GROUP BY res.objeto, res.data
	              LOOP
		         _nop:= 1;
		         _linhaRES.descricao:= _linhaOBJ.descricao;
		         RETURN NEXT _linhaRES;
		      END LOOP;
		IF (_nop = 0) THEN
		        _linhaRES_new.objeto:= _linhaOBJ.id;
		        _linhaRES_new.data:= $1;
			_linhaRES_new.mat_aula_1:= 0;
			_linhaRES_new.mat_aula_2:= 0;
			_linhaRES_new.mat_aula_3:= 0;
			_linhaRES_new.mat_aula_4:= 0;
			_linhaRES_new.almoco:= 0;
			_linhaRES_new.vesp_aula_1:= 0;
			_linhaRES_new.vesp_aula_2:= 0;
			_linhaRES_new.vesp_aula_3:= 0;
			_linhaRES_new.vesp_aula_4:= 0;
			_linhaRES_new.janta:= 0;
			_linhaRES_new.not_aula_1:= 0;
			_linhaRES_new.not_aula_2:= 0;
			_linhaRES_new.not_aula_3:= 0;
			_linhaRES_new.not_aula_4:= 0;
			_linhaRES_new.descricao:= _linhaOBJ.descricao;
			RETURN NEXT _linhaRES_new;
		END IF;
       END LOOP;
       
    RETURN;
END;
$_$;


ALTER FUNCTION public.obter_reservas(integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 197 (class 1259 OID 24581)
-- Name: cursos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cursos (
    id integer NOT NULL,
    descricao character varying(120) NOT NULL,
    ativo boolean DEFAULT true,
    sigla character varying(10)
);


ALTER TABLE public.cursos OWNER TO postgres;

--
-- TOC entry 198 (class 1259 OID 24585)
-- Name: cursos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cursos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cursos_id_seq OWNER TO postgres;

--
-- TOC entry 2939 (class 0 OID 0)
-- Dependencies: 198
-- Name: cursos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cursos_id_seq OWNED BY public.cursos.id;


--
-- TOC entry 199 (class 1259 OID 24587)
-- Name: disciplinas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disciplinas (
    id integer NOT NULL,
    descricao character varying(100) NOT NULL,
    sigla character varying(10) NOT NULL,
    curso integer NOT NULL,
    ativo boolean DEFAULT true,
    carga_horaria integer,
    semestre integer
);


ALTER TABLE public.disciplinas OWNER TO postgres;

--
-- TOC entry 2940 (class 0 OID 0)
-- Dependencies: 199
-- Name: COLUMN disciplinas.semestre; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.disciplinas.semestre IS 'Semestre em que a disciplina é oferecida na matriz.';


--
-- TOC entry 200 (class 1259 OID 24591)
-- Name: disciplinas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.disciplinas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.disciplinas_id_seq OWNER TO postgres;

--
-- TOC entry 2941 (class 0 OID 0)
-- Dependencies: 200
-- Name: disciplinas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.disciplinas_id_seq OWNED BY public.disciplinas.id;


--
-- TOC entry 201 (class 1259 OID 24593)
-- Name: objetos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.objetos (
    id integer NOT NULL,
    tipo_objeto integer,
    descricao character varying(30),
    ativo boolean DEFAULT true
);


ALTER TABLE public.objetos OWNER TO postgres;

--
-- TOC entry 202 (class 1259 OID 24597)
-- Name: objetos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.objetos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.objetos_id_seq OWNER TO postgres;

--
-- TOC entry 2942 (class 0 OID 0)
-- Dependencies: 202
-- Name: objetos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.objetos_id_seq OWNED BY public.objetos.id;


--
-- TOC entry 203 (class 1259 OID 24599)
-- Name: oferecimentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oferecimentos (
    id integer NOT NULL,
    usuario integer,
    disciplina integer,
    periodo integer,
    ativo boolean DEFAULT true
);


ALTER TABLE public.oferecimentos OWNER TO postgres;

--
-- TOC entry 204 (class 1259 OID 24603)
-- Name: oferecimentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.oferecimentos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.oferecimentos_id_seq OWNER TO postgres;

--
-- TOC entry 2943 (class 0 OID 0)
-- Dependencies: 204
-- Name: oferecimentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.oferecimentos_id_seq OWNED BY public.oferecimentos.id;


--
-- TOC entry 205 (class 1259 OID 24605)
-- Name: operacoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operacoes (
    id integer NOT NULL,
    descricao character varying(255),
    ativo boolean DEFAULT true
);


ALTER TABLE public.operacoes OWNER TO postgres;

--
-- TOC entry 206 (class 1259 OID 24609)
-- Name: operacoes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operacoes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.operacoes_id_seq OWNER TO postgres;

--
-- TOC entry 2944 (class 0 OID 0)
-- Dependencies: 206
-- Name: operacoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operacoes_id_seq OWNED BY public.operacoes.id;


--
-- TOC entry 207 (class 1259 OID 24611)
-- Name: perfis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.perfis (
    id integer NOT NULL,
    usuario integer,
    tipo_objeto integer,
    ativo boolean DEFAULT true
);


ALTER TABLE public.perfis OWNER TO postgres;

--
-- TOC entry 208 (class 1259 OID 24615)
-- Name: perfil_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.perfil_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.perfil_id_seq OWNER TO postgres;

--
-- TOC entry 2945 (class 0 OID 0)
-- Dependencies: 208
-- Name: perfil_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.perfil_id_seq OWNED BY public.perfis.id;


--
-- TOC entry 209 (class 1259 OID 24617)
-- Name: periodos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.periodos (
    id integer NOT NULL,
    data_inicio bigint,
    data_fim bigint,
    nome character varying(6),
    ativo boolean
);


ALTER TABLE public.periodos OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 24620)
-- Name: periodos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.periodos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.periodos_id_seq OWNER TO postgres;

--
-- TOC entry 2946 (class 0 OID 0)
-- Dependencies: 210
-- Name: periodos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.periodos_id_seq OWNED BY public.periodos.id;


--
-- TOC entry 211 (class 1259 OID 24622)
-- Name: reservas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas (
    id integer NOT NULL,
    objeto integer,
    oferecimento integer,
    observacao character varying(120),
    data bigint,
    mat_aula_1 boolean,
    mat_aula_2 boolean,
    mat_aula_3 boolean,
    mat_aula_4 boolean,
    almoco boolean,
    vesp_aula_1 boolean,
    vesp_aula_2 boolean,
    vesp_aula_3 boolean,
    vesp_aula_4 boolean,
    janta boolean,
    not_aula_1 boolean,
    not_aula_2 boolean,
    not_aula_3 boolean,
    not_aula_4 boolean,
    ativo boolean DEFAULT true,
    operacao integer
);


ALTER TABLE public.reservas OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 24626)
-- Name: reservas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reservas_id_seq OWNER TO postgres;

--
-- TOC entry 2947 (class 0 OID 0)
-- Dependencies: 212
-- Name: reservas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservas_id_seq OWNED BY public.reservas.id;


--
-- TOC entry 213 (class 1259 OID 24628)
-- Name: tipos_objeto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipos_objeto (
    id integer NOT NULL,
    descricao character varying(30),
    ativo boolean
);


ALTER TABLE public.tipos_objeto OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 24631)
-- Name: tipos_objeto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipos_objeto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tipos_objeto_id_seq OWNER TO postgres;

--
-- TOC entry 2948 (class 0 OID 0)
-- Dependencies: 214
-- Name: tipos_objeto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipos_objeto_id_seq OWNED BY public.tipos_objeto.id;


--
-- TOC entry 215 (class 1259 OID 24633)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nome character varying(120) NOT NULL,
    usr character varying(60) NOT NULL,
    passwd character varying(32) NOT NULL,
    ativo boolean DEFAULT true,
    admin boolean DEFAULT false NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 24638)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 2949 (class 0 OID 0)
-- Dependencies: 216
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 2764 (class 2604 OID 24640)
-- Name: cursos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos ALTER COLUMN id SET DEFAULT nextval('public.cursos_id_seq'::regclass);


--
-- TOC entry 2766 (class 2604 OID 24641)
-- Name: disciplinas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinas ALTER COLUMN id SET DEFAULT nextval('public.disciplinas_id_seq'::regclass);


--
-- TOC entry 2768 (class 2604 OID 24642)
-- Name: objetos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.objetos ALTER COLUMN id SET DEFAULT nextval('public.objetos_id_seq'::regclass);


--
-- TOC entry 2770 (class 2604 OID 24643)
-- Name: oferecimentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferecimentos ALTER COLUMN id SET DEFAULT nextval('public.oferecimentos_id_seq'::regclass);


--
-- TOC entry 2772 (class 2604 OID 24644)
-- Name: operacoes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operacoes ALTER COLUMN id SET DEFAULT nextval('public.operacoes_id_seq'::regclass);


--
-- TOC entry 2774 (class 2604 OID 24645)
-- Name: perfis id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfis ALTER COLUMN id SET DEFAULT nextval('public.perfil_id_seq'::regclass);


--
-- TOC entry 2775 (class 2604 OID 24646)
-- Name: periodos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodos ALTER COLUMN id SET DEFAULT nextval('public.periodos_id_seq'::regclass);


--
-- TOC entry 2777 (class 2604 OID 24647)
-- Name: reservas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas ALTER COLUMN id SET DEFAULT nextval('public.reservas_id_seq'::regclass);


--
-- TOC entry 2778 (class 2604 OID 24648)
-- Name: tipos_objeto id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_objeto ALTER COLUMN id SET DEFAULT nextval('public.tipos_objeto_id_seq'::regclass);


--
-- TOC entry 2781 (class 2604 OID 24649)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 2783 (class 2606 OID 24651)
-- Name: cursos pk_cursos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT pk_cursos PRIMARY KEY (id);


--
-- TOC entry 2785 (class 2606 OID 24653)
-- Name: disciplinas pk_disciplinas; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinas
    ADD CONSTRAINT pk_disciplinas PRIMARY KEY (id);


--
-- TOC entry 2787 (class 2606 OID 24655)
-- Name: objetos pk_objeto; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.objetos
    ADD CONSTRAINT pk_objeto PRIMARY KEY (id);


--
-- TOC entry 2789 (class 2606 OID 24657)
-- Name: oferecimentos pk_oferecimentos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferecimentos
    ADD CONSTRAINT pk_oferecimentos PRIMARY KEY (id);


--
-- TOC entry 2791 (class 2606 OID 24659)
-- Name: operacoes pk_operacao; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operacoes
    ADD CONSTRAINT pk_operacao PRIMARY KEY (id);


--
-- TOC entry 2793 (class 2606 OID 24661)
-- Name: perfis pk_perfis; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfis
    ADD CONSTRAINT pk_perfis PRIMARY KEY (id);


--
-- TOC entry 2795 (class 2606 OID 24663)
-- Name: periodos pk_periodos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodos
    ADD CONSTRAINT pk_periodos PRIMARY KEY (id);


--
-- TOC entry 2797 (class 2606 OID 24665)
-- Name: reservas pk_reservas; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT pk_reservas PRIMARY KEY (id);


--
-- TOC entry 2799 (class 2606 OID 24667)
-- Name: tipos_objeto tipos_objeto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_objeto
    ADD CONSTRAINT tipos_objeto_pkey PRIMARY KEY (id);


--
-- TOC entry 2801 (class 2606 OID 24669)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 2802 (class 2606 OID 24670)
-- Name: disciplinas fk_curso_disciplina; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinas
    ADD CONSTRAINT fk_curso_disciplina FOREIGN KEY (curso) REFERENCES public.cursos(id);


--
-- TOC entry 2803 (class 2606 OID 24675)
-- Name: objetos fk_objeto_tipo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.objetos
    ADD CONSTRAINT fk_objeto_tipo FOREIGN KEY (tipo_objeto) REFERENCES public.tipos_objeto(id);


--
-- TOC entry 2808 (class 2606 OID 24680)
-- Name: reservas fk_objetos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT fk_objetos FOREIGN KEY (objeto) REFERENCES public.objetos(id);


--
-- TOC entry 2809 (class 2606 OID 24685)
-- Name: reservas fk_oferecimento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT fk_oferecimento FOREIGN KEY (oferecimento) REFERENCES public.oferecimentos(id);


--
-- TOC entry 2804 (class 2606 OID 24690)
-- Name: oferecimentos fk_oferecimento_periodo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferecimentos
    ADD CONSTRAINT fk_oferecimento_periodo FOREIGN KEY (periodo) REFERENCES public.periodos(id);


--
-- TOC entry 2805 (class 2606 OID 24695)
-- Name: oferecimentos fk_oferecimento_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferecimentos
    ADD CONSTRAINT fk_oferecimento_usuario FOREIGN KEY (usuario) REFERENCES public.usuarios(id);


--
-- TOC entry 2806 (class 2606 OID 24700)
-- Name: perfis fk_tipo_objeto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfis
    ADD CONSTRAINT fk_tipo_objeto FOREIGN KEY (tipo_objeto) REFERENCES public.tipos_objeto(id);


--
-- TOC entry 2807 (class 2606 OID 24705)
-- Name: perfis fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfis
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario) REFERENCES public.usuarios(id);


-- Completed on 2018-07-10 14:26:20 -04

--
-- PostgreSQL database dump complete
--

