--
-- PostgreSQL database dump
--

-- Dumped from database version 10.3 (Ubuntu 10.3-1.pgdg14.04+1)
-- Dumped by pg_dump version 10.3 (Ubuntu 10.3-1.pgdg14.04+1)

-- Started on 2018-08-29 08:05:56 -04

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
-- TOC entry 2971 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- TOC entry 531 (class 1247 OID 25293)
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
-- TOC entry 233 (class 1255 OID 25294)
-- Name: desativar_disciplina(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.desativar_disciplina(_id_disciplina integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE
	_linha_oferecimento oferecimentos%rowtype;
    BEGIN
        UPDATE disciplinas SET ativo = false where id = _id_disciplina;
        
        FOR _linha_oferecimento IN SELECT * FROM oferecimentos WHERE disciplina = _id_disciplina LOOP
            RAISE NOTICE '_linha_oferecimento.id (%)', _linha_oferecimento.id;
            perform desativar_oferecimentos(_linha_oferecimento.id);
            
	END LOOP;	
    RETURN;
    END;
$$;


ALTER FUNCTION public.desativar_disciplina(_id_disciplina integer) OWNER TO postgres;

--
-- TOC entry 222 (class 1255 OID 25295)
-- Name: desativar_objeto(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.desativar_objeto(integer) RETURNS void
    LANGUAGE plpgsql
    AS $_$
    BEGIN
	UPDATE objetos SET ativo = false WHERE id = $1;						--DESATIVA O OBJETO
	UPDATE reservas SET ativo = false WHERE objeto = $1; 					--DESATIVA AS RESERVAS
	UPDATE operacoes SET ativo = false							--DESATIVA AS OPERACOES
		FROM reservas
		WHERE ((reservas.operacao = operacoes.id) AND (reservas.objeto = $1));
    RETURN;
    END;
$_$;


ALTER FUNCTION public.desativar_objeto(integer) OWNER TO postgres;

--
-- TOC entry 229 (class 1255 OID 25296)
-- Name: desativar_oferecimentos(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.desativar_oferecimentos(id_oferecimento integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
    BEGIN
        UPDATE oferecimentos SET ativo = false WHERE id = id_oferecimento;
        
        UPDATE operacoes SET ativo = false WHERE oferecimento = id_oferecimento;
        
        UPDATE reservas r SET ativo = false
            FROM operacoes op, oferecimentos ofe
            WHERE ((r.operacao = op.id) AND (op.oferecimento = ofe.id) AND (ofe.id = id_oferecimento));
        raise notice 'id_oferecimento(%)', id_oferecimento;
    RETURN;
    END;
$$;


ALTER FUNCTION public.desativar_oferecimentos(id_oferecimento integer) OWNER TO postgres;

--
-- TOC entry 234 (class 1255 OID 25297)
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
    FOR _linhaOBJ IN SELECT * FROM objetos where ativo = true order by descricao
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
		   WHERE (res.data = $1 AND res.objeto = _linhaOBJ.id AND res.ativo = true) 
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

--
-- TOC entry 231 (class 1255 OID 25298)
-- Name: obter_reservas_por_tipo_objeto(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.obter_reservas_por_tipo_objeto(integer, integer) RETURNS SETOF public.reservasaux
    LANGUAGE plpgsql
    AS $_$
DECLARE
    _linhaOBJ objetos%rowtype;
    _linhaRES reservasAUX%rowtype;
    _linhaRES_new reservasAUX%rowtype;
    _nop int;
BEGIN
-- $1 data da reserva
-- $2 tipo de objeto
    FOR _linhaOBJ IN SELECT * FROM objetos
        INNER JOIN tipos_objeto tip ON tip.id = objetos.tipo_objeto
        WHERE (tip.id = $2)
        order by objetos.descricao
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
		   WHERE (res.data = $1 AND res.objeto = _linhaOBJ.id AND res.ativo = true)
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


ALTER FUNCTION public.obter_reservas_por_tipo_objeto(integer, integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 197 (class 1259 OID 25299)
-- Name: cursos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cursos (
    id integer NOT NULL,
    descricao character varying(120) NOT NULL,
    sigla character varying(10)
);


ALTER TABLE public.cursos OWNER TO postgres;

--
-- TOC entry 198 (class 1259 OID 25302)
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
-- TOC entry 2972 (class 0 OID 0)
-- Dependencies: 198
-- Name: cursos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cursos_id_seq OWNED BY public.cursos.id;


--
-- TOC entry 199 (class 1259 OID 25304)
-- Name: disciplinas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disciplinas (
    id integer NOT NULL,
    descricao character varying(100) NOT NULL,
    sigla character varying(10) NOT NULL,
    curso integer NOT NULL,
    ativo boolean DEFAULT true,
    carga_horaria integer,
    semestre integer,
    creditos character varying(10) DEFAULT 0 NOT NULL
);


ALTER TABLE public.disciplinas OWNER TO postgres;

--
-- TOC entry 2973 (class 0 OID 0)
-- Dependencies: 199
-- Name: COLUMN disciplinas.semestre; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.disciplinas.semestre IS 'Semestre em que a disciplina é oferecida na matriz.';


--
-- TOC entry 200 (class 1259 OID 25309)
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
-- TOC entry 2974 (class 0 OID 0)
-- Dependencies: 200
-- Name: disciplinas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.disciplinas_id_seq OWNED BY public.disciplinas.id;


--
-- TOC entry 201 (class 1259 OID 25311)
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
-- TOC entry 202 (class 1259 OID 25315)
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
-- TOC entry 2975 (class 0 OID 0)
-- Dependencies: 202
-- Name: objetos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.objetos_id_seq OWNED BY public.objetos.id;


--
-- TOC entry 203 (class 1259 OID 25317)
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
-- TOC entry 204 (class 1259 OID 25321)
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
-- TOC entry 2976 (class 0 OID 0)
-- Dependencies: 204
-- Name: oferecimentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.oferecimentos_id_seq OWNED BY public.oferecimentos.id;


--
-- TOC entry 205 (class 1259 OID 25323)
-- Name: operacoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operacoes (
    id integer NOT NULL,
    descricao character varying(255),
    ativo boolean DEFAULT true,
    oferecimento integer
);


ALTER TABLE public.operacoes OWNER TO postgres;

--
-- TOC entry 206 (class 1259 OID 25327)
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
-- TOC entry 2977 (class 0 OID 0)
-- Dependencies: 206
-- Name: operacoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operacoes_id_seq OWNED BY public.operacoes.id;


--
-- TOC entry 207 (class 1259 OID 25329)
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
-- TOC entry 208 (class 1259 OID 25333)
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
-- TOC entry 2978 (class 0 OID 0)
-- Dependencies: 208
-- Name: perfil_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.perfil_id_seq OWNED BY public.perfis.id;


--
-- TOC entry 209 (class 1259 OID 25335)
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
-- TOC entry 210 (class 1259 OID 25338)
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
-- TOC entry 2979 (class 0 OID 0)
-- Dependencies: 210
-- Name: periodos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.periodos_id_seq OWNED BY public.periodos.id;


--
-- TOC entry 211 (class 1259 OID 25340)
-- Name: reservas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas (
    id integer NOT NULL,
    objeto integer,
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
-- TOC entry 212 (class 1259 OID 25344)
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
-- TOC entry 2980 (class 0 OID 0)
-- Dependencies: 212
-- Name: reservas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservas_id_seq OWNED BY public.reservas.id;


--
-- TOC entry 213 (class 1259 OID 25346)
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 25352)
-- Name: tipos_objeto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipos_objeto (
    id integer NOT NULL,
    descricao character varying(30)
);


ALTER TABLE public.tipos_objeto OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 25355)
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
-- TOC entry 2981 (class 0 OID 0)
-- Dependencies: 215
-- Name: tipos_objeto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipos_objeto_id_seq OWNED BY public.tipos_objeto.id;


--
-- TOC entry 216 (class 1259 OID 25357)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nome character varying(120) NOT NULL,
    usr character varying(11) NOT NULL,
    passwd character varying(32) NOT NULL,
    admin boolean DEFAULT false NOT NULL,
    primeiro_login boolean DEFAULT false
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 25362)
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
-- TOC entry 2982 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 2772 (class 2604 OID 25364)
-- Name: cursos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos ALTER COLUMN id SET DEFAULT nextval('public.cursos_id_seq'::regclass);


--
-- TOC entry 2775 (class 2604 OID 25365)
-- Name: disciplinas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinas ALTER COLUMN id SET DEFAULT nextval('public.disciplinas_id_seq'::regclass);


--
-- TOC entry 2777 (class 2604 OID 25366)
-- Name: objetos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.objetos ALTER COLUMN id SET DEFAULT nextval('public.objetos_id_seq'::regclass);


--
-- TOC entry 2779 (class 2604 OID 25367)
-- Name: oferecimentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferecimentos ALTER COLUMN id SET DEFAULT nextval('public.oferecimentos_id_seq'::regclass);


--
-- TOC entry 2781 (class 2604 OID 25368)
-- Name: operacoes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operacoes ALTER COLUMN id SET DEFAULT nextval('public.operacoes_id_seq'::regclass);


--
-- TOC entry 2783 (class 2604 OID 25369)
-- Name: perfis id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfis ALTER COLUMN id SET DEFAULT nextval('public.perfil_id_seq'::regclass);


--
-- TOC entry 2784 (class 2604 OID 25370)
-- Name: periodos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodos ALTER COLUMN id SET DEFAULT nextval('public.periodos_id_seq'::regclass);


--
-- TOC entry 2786 (class 2604 OID 25371)
-- Name: reservas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas ALTER COLUMN id SET DEFAULT nextval('public.reservas_id_seq'::regclass);


--
-- TOC entry 2787 (class 2604 OID 25372)
-- Name: tipos_objeto id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_objeto ALTER COLUMN id SET DEFAULT nextval('public.tipos_objeto_id_seq'::regclass);


--
-- TOC entry 2790 (class 2604 OID 25373)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 2943 (class 0 OID 25299)
-- Dependencies: 197
-- Data for Name: cursos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cursos (id, descricao, sigla) FROM stdin;
\.


--
-- TOC entry 2945 (class 0 OID 25304)
-- Dependencies: 199
-- Data for Name: disciplinas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disciplinas (id, descricao, sigla, curso, ativo, carga_horaria, semestre, creditos) FROM stdin;
\.


--
-- TOC entry 2947 (class 0 OID 25311)
-- Dependencies: 201
-- Data for Name: objetos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.objetos (id, tipo_objeto, descricao, ativo) FROM stdin;
\.


--
-- TOC entry 2949 (class 0 OID 25317)
-- Dependencies: 203
-- Data for Name: oferecimentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oferecimentos (id, usuario, disciplina, periodo, ativo) FROM stdin;
\.


--
-- TOC entry 2951 (class 0 OID 25323)
-- Dependencies: 205
-- Data for Name: operacoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operacoes (id, descricao, ativo, oferecimento) FROM stdin;
\.


--
-- TOC entry 2953 (class 0 OID 25329)
-- Dependencies: 207
-- Data for Name: perfis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.perfis (id, usuario, tipo_objeto, ativo) FROM stdin;
\.


--
-- TOC entry 2955 (class 0 OID 25335)
-- Dependencies: 209
-- Data for Name: periodos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.periodos (id, data_inicio, data_fim, nome, ativo) FROM stdin;
\.


--
-- TOC entry 2957 (class 0 OID 25340)
-- Dependencies: 211
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservas (id, objeto, observacao, data, mat_aula_1, mat_aula_2, mat_aula_3, mat_aula_4, almoco, vesp_aula_1, vesp_aula_2, vesp_aula_3, vesp_aula_4, janta, not_aula_1, not_aula_2, not_aula_3, not_aula_4, ativo, operacao) FROM stdin;
\.


--
-- TOC entry 2959 (class 0 OID 25346)
-- Dependencies: 213
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
4qtMRiVok-cGezwSymYUYDl4CH7doR3e	{"cookie":{"originalMaxAge":3600000,"expires":"2018-08-17T23:33:32.908Z","httpOnly":true,"path":"/"},"autorizado":true,"usr":"00000000000","nome":"root","admin":true}	2018-08-17 19:33:33
\.


--
-- TOC entry 2960 (class 0 OID 25352)
-- Dependencies: 214
-- Data for Name: tipos_objeto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_objeto (id, descricao) FROM stdin;
\.


--
-- TOC entry 2962 (class 0 OID 25357)
-- Dependencies: 216
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nome, usr, passwd, admin, primeiro_login) FROM stdin;
1	root	00000000000	6bab6e5e6d45a17eb5a4b72140f91517	t	t
\.


--
-- TOC entry 2983 (class 0 OID 0)
-- Dependencies: 198
-- Name: cursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cursos_id_seq', 1, false);


--
-- TOC entry 2984 (class 0 OID 0)
-- Dependencies: 200
-- Name: disciplinas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.disciplinas_id_seq', 1, false);


--
-- TOC entry 2985 (class 0 OID 0)
-- Dependencies: 202
-- Name: objetos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.objetos_id_seq', 1, false);


--
-- TOC entry 2986 (class 0 OID 0)
-- Dependencies: 204
-- Name: oferecimentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.oferecimentos_id_seq', 1, false);


--
-- TOC entry 2987 (class 0 OID 0)
-- Dependencies: 206
-- Name: operacoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operacoes_id_seq', 1, false);


--
-- TOC entry 2988 (class 0 OID 0)
-- Dependencies: 208
-- Name: perfil_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.perfil_id_seq', 1, false);


--
-- TOC entry 2989 (class 0 OID 0)
-- Dependencies: 210
-- Name: periodos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.periodos_id_seq', 1, false);


--
-- TOC entry 2990 (class 0 OID 0)
-- Dependencies: 212
-- Name: reservas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservas_id_seq', 1, false);


--
-- TOC entry 2991 (class 0 OID 0)
-- Dependencies: 215
-- Name: tipos_objeto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipos_objeto_id_seq', 1, false);


--
-- TOC entry 2992 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 4, true);


--
-- TOC entry 2792 (class 2606 OID 25375)
-- Name: cursos pk_cursos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT pk_cursos PRIMARY KEY (id);


--
-- TOC entry 2794 (class 2606 OID 25377)
-- Name: disciplinas pk_disciplinas; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinas
    ADD CONSTRAINT pk_disciplinas PRIMARY KEY (id);


--
-- TOC entry 2796 (class 2606 OID 25379)
-- Name: objetos pk_objeto; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.objetos
    ADD CONSTRAINT pk_objeto PRIMARY KEY (id);


--
-- TOC entry 2798 (class 2606 OID 25381)
-- Name: oferecimentos pk_oferecimentos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferecimentos
    ADD CONSTRAINT pk_oferecimentos PRIMARY KEY (id);


--
-- TOC entry 2800 (class 2606 OID 25383)
-- Name: operacoes pk_operacao; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operacoes
    ADD CONSTRAINT pk_operacao PRIMARY KEY (id);


--
-- TOC entry 2802 (class 2606 OID 25385)
-- Name: perfis pk_perfis; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfis
    ADD CONSTRAINT pk_perfis PRIMARY KEY (id);


--
-- TOC entry 2804 (class 2606 OID 25387)
-- Name: periodos pk_periodos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodos
    ADD CONSTRAINT pk_periodos PRIMARY KEY (id);


--
-- TOC entry 2806 (class 2606 OID 25389)
-- Name: reservas pk_reservas; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT pk_reservas PRIMARY KEY (id);


--
-- TOC entry 2808 (class 2606 OID 25391)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 2810 (class 2606 OID 25393)
-- Name: tipos_objeto tipos_objeto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_objeto
    ADD CONSTRAINT tipos_objeto_pkey PRIMARY KEY (id);


--
-- TOC entry 2812 (class 2606 OID 25395)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 2813 (class 2606 OID 25396)
-- Name: disciplinas fk_curso_disciplina; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinas
    ADD CONSTRAINT fk_curso_disciplina FOREIGN KEY (curso) REFERENCES public.cursos(id);


--
-- TOC entry 2814 (class 2606 OID 25401)
-- Name: objetos fk_objeto_tipo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.objetos
    ADD CONSTRAINT fk_objeto_tipo FOREIGN KEY (tipo_objeto) REFERENCES public.tipos_objeto(id);


--
-- TOC entry 2820 (class 2606 OID 25406)
-- Name: reservas fk_objetos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT fk_objetos FOREIGN KEY (objeto) REFERENCES public.objetos(id);


--
-- TOC entry 2817 (class 2606 OID 25411)
-- Name: operacoes fk_oferecimento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operacoes
    ADD CONSTRAINT fk_oferecimento FOREIGN KEY (oferecimento) REFERENCES public.oferecimentos(id);


--
-- TOC entry 2815 (class 2606 OID 25416)
-- Name: oferecimentos fk_oferecimento_periodo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferecimentos
    ADD CONSTRAINT fk_oferecimento_periodo FOREIGN KEY (periodo) REFERENCES public.periodos(id);


--
-- TOC entry 2816 (class 2606 OID 25421)
-- Name: oferecimentos fk_oferecimento_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oferecimentos
    ADD CONSTRAINT fk_oferecimento_usuario FOREIGN KEY (usuario) REFERENCES public.usuarios(id);


--
-- TOC entry 2821 (class 2606 OID 25426)
-- Name: reservas fk_operacao; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT fk_operacao FOREIGN KEY (operacao) REFERENCES public.operacoes(id);


--
-- TOC entry 2818 (class 2606 OID 25431)
-- Name: perfis fk_tipo_objeto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfis
    ADD CONSTRAINT fk_tipo_objeto FOREIGN KEY (tipo_objeto) REFERENCES public.tipos_objeto(id);


--
-- TOC entry 2819 (class 2606 OID 25436)
-- Name: perfis fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfis
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario) REFERENCES public.usuarios(id);


-- Completed on 2018-08-29 08:05:56 -04

--
-- PostgreSQL database dump complete
--

