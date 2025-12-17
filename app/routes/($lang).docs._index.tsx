
import ReactMarkdown from "react-markdown";
// @ts-ignore
import zhPrivacy from '../../content/zh/docs/3.privacy&policy.md?raw';
// @ts-ignore
import enPrivacy from '../../content/en/docs/3.privacy&policy.md?raw';

interface DocsIndexParams {
	params: { lang: string };
}

export default function DocsIndex({ params }: DocsIndexParams) {
	const { lang } = params;
	let content = "";
	if (lang === "zh") {
		content = zhPrivacy;
	} else if (lang === "en") {
		content = enPrivacy;
	} else {
		return <main>Not found.</main>;
	}
	return (
		<main className="prose mx-auto p-4">
			<ReactMarkdown>{content}</ReactMarkdown>
		</main>
	);
}
