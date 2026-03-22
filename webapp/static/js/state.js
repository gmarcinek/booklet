// Shared mutable state — imported by all modules.
// Mutate fields directly (e.g. S.file = f), never replace the object.
export const S = {
    file:       null,
    docs:       { input: null, output: null },
    pages:      { input: 0,    output: 0    },
    cur:        { input: 1,    output: 1    },
    divide:     16,
    flip:       'short',
    sep:        true,
    resultBlob: null,
    resultName: '',
};
