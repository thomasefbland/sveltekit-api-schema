type UnwrappedSuccessfulResponse<Data extends Record<string, any>> = {
	ok: true;
	json: Data;
};
type UnwrappedFailedResponse = {
	ok: false;
	json: {
		message: string;
	};
};
export type UnwrappedResponse<Data extends Record<string, any>> = UnwrappedSuccessfulResponse<Data> | UnwrappedFailedResponse;
