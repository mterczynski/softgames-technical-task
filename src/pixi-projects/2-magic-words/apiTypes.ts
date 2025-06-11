export interface MagicWordsApiResponse {
	dialogue: Array<{
		name: string;
		text: string;
	}>;
	emojies: Array<{
		name: string;
		url: string;
	}>;
	avatars: Array<{
		name: string;
		url: string;
		position: string;
	}>;
}
