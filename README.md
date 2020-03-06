# merge-localization-labels
Tool to merge localization labels for SuccessFactors.

Use the Export Labels option to generate a source localisation file - this will typically be English language

Use the Export Labels option to generate a target localisation file - this will be were we merge the English language labels into.

## Installation

```bash
npm install https://github.com/martinholden-skillsoft/merge-localization-labels
```

## CLI

We have the following files generated from SuccessFactors:
* partlms0345_subjectareas_en.txt - this is all the labels in English for the Subject Areas
* partlms0345_subjectareas_de.txt - this is all the populated labels in German for the Subject Areas

Our goal is to merge the labels we have in English that are missing from the German file.

```merge-localization-labels -s partlms0345_subjectareas_en.txt -t partlms0345_subjectareas_de.txt -o newlabels.txt```


## License

MIT © Martin Holden
