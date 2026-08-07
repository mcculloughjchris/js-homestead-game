import { Item } from './itemTypes'

export interface BookType extends Item {
  category: 'book'
  author: string
}

export interface BookTypes {
  [k: string]: BookType
}

const bookItems: BookTypes = {
  'quotations_from_chairman_mao_tse-tung': {
    id: 'quotations_from_chairman_mao_tse-tung',
    name: 'Quotations from Chairman Mao Tse-tung',
    category: 'book',
    author: 'Mao Tse-tung',
    value: 100,
    illegal: true
  },
  'the_communist_manifesto': {
    id: 'the_communist_manifesto',
    name: 'The Communist Manifesto',
    category: 'book',
    author: 'Karl Marx',
    value: 200,
    illegal: true
  },
  'the_state_and_revolution': {
    id: 'the_state_and_revolution',
    name: 'The State and Revolution',
    category: 'book',
    author: 'Vladimir Lenin',
    value: 100,
    illegal: true
  },
  'socialism_utopian_and_scientific': {
    id: 'socialism_utopian_and_scientific',
    name: 'Socialism: Utopian and Scientific',
    category: 'book',
    author: 'Friedrich Engels',
    value: 125,
    illegal: true
  },
  'a_hacker_manifesto': {
    id: 'a_hacker_manifesto',
    name: 'A Hacker Manifesto',
    category: 'book',
    author: 'McKenzie Wark',
    value: 85,
    illegal: true
  },
  'why_socialism': {
    id: 'why_socialism',
    name: 'Why Socialism?',
    category: 'book',
    author: 'Albert Einstein',
    value: 75,
    illegal: true
  },
  'revolutionary_suicide': {
    id: 'revolutionary_suicide',
    name: 'Revolutionary Suicide',
    category: 'book',
    author: 'Huey P. Newton',
    value: 125,
    illegal: true
  },
  'what_is_to_be_done': {
    id: 'what_is_to_be_done',
    name: 'What Is to Be Done?',
    category: 'book',
    author: 'Vladimir Lenin',
    value: 250,
    illegal: true
  },
  'das_kapital': {
    id: 'das_kapital',
    name: 'Das Kapital',
    category: 'book',
    author: 'Karl Marx',
    value: 300,
    illegal: true
  }
}

export default bookItems
