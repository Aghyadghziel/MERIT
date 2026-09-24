import { notFound } from 'next/navigation';

/** Any path no route claims, in either language, renders the house 404. */
export default function Missing() {
  notFound();
}
