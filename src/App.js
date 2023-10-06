import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Checkbox, Grid, Typography, IconButton, FormControlLabel } from "@material-ui/core";
import { CancelPresentationRounded, FindReplace, Compare as CompareIcon, InsertDriveFileOutlined } from '@material-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCodeCompare } from '@fortawesome/free-solid-svg-icons';
import { diffChars, diffLines } from 'diff';

function App() {
    const [file1, setFile1] = useState("");
    const [file2, setFile2] = useState("");
    const [diff, setDiff] = useState(null);
    const [activeDiffIndex, setActiveDiffIndex] = useState(0);
    const [excludePattern, setExcludePattern] = useState("");
    const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDiff, setSelectedDiff] = useState(null);


    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDiff(null);
    };

    const handleLineClick = (leftLine, rightLine, side) => {
        if (side === "left") {
            setSelectedDiff({left: leftLine, right: rightLine});
        } else {
            setSelectedDiff({left: rightLine, right: leftLine});
        }
        setIsModalOpen(true);
    };

    const filteredText = useCallback((text) => {
        if (!excludePattern) return text;

        return text.split('\n').filter(line => !line.startsWith(excludePattern)).join('\n');
    }, [excludePattern]);


    const compareFiles = () => {
        if (!file1 || !file2) {
            alert("Please select two files to compare!!!");
            return;
        }
        const diffResult = diffLines(filteredText(file1), filteredText(file2));
        setDiff(diffResult);
        setActiveDiffIndex(0); 
    };

    const triggerFileInput = (fileInputRef) => {
        fileInputRef.current.click();
    };

    const fileInputRef1 = useRef(null);
    const fileInputRef2 = useRef(null);

    const onFileChange = (e, setFileFn) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            setFileFn(e.target.result);
        };
        reader.readAsText(file);
    };

    const addLeftDiff = (lineNumber, diffIdx, line) => (
        <div key={lineNumber} id={`diff-${diffIdx}`} style={{ display: 'flex' }}>
            <span style={{ width: '30px', display: 'inline-block' }}>{lineNumber}</span>
            <span style={{ flexGrow: 1 }}>{line}</span>
        </div>
    );

    const addRightDiff = (lineNumber, diffIdx, line) => (
        <div key={lineNumber} id={`diff-${diffIdx}`} style={{ display: 'flex' }}>
            <span style={{ width: '30px', display: 'inline-block' }}>{lineNumber}</span>
            <span style={{ flexGrow: 1 }}>{line}</span>
        </div>
    );

    const addDiffWithColor = (lineNumber, diffIdx, leftLine, rightLine, color, side) => (
        <div key={lineNumber} id={`diff-${diffIdx}`} style={{ display: 'flex' }} onClick={() => handleLineClick(leftLine, rightLine, side)}>
            <span style={{ width: '30px', display: 'inline-block' }}>{lineNumber}</span>
            <span style={{ backgroundColor: color, flexGrow: 1 }}>{leftLine || rightLine}</span>
        </div>
    );

    const createDiffElement = (lineNumber, diffIdx, line, backgroundColor, text = line) => (
        <div key={lineNumber} id={`diff-${diffIdx}`} style={{ display: 'flex' }}>
            <span style={{ width: '30px', display: 'inline-block' }}>{lineNumber}</span>
            <span style={{ backgroundColor, flexGrow: 1 }}>{text}</span>
        </div>
    );

    const jumpToNextDiff = () => {
        let nextDiffIdx = -1;
        diff.some((part, idx) => {
            if (part.added || part.removed) {
                nextDiffIdx++;
                if (nextDiffIdx > activeDiffIndex) {
                    setActiveDiffIndex(nextDiffIdx);
                    return true;
                }
            }
            return false;
        });

        if (nextDiffIdx <= activeDiffIndex) {
            setActiveDiffIndex(0);
        }


    };

    useEffect(() => {
        jumpToDiff(activeDiffIndex);
    }, [activeDiffIndex]);


    const jumpToDiff = (idx) => {
        const element = document.getElementById(`diff-${idx}`);
        if(element) {
            const rect = element.getBoundingClientRect();
            const offset = 150; 
            window.scrollTo({
                top: rect.top + window.scrollY - offset, 
                behavior: 'smooth'
            });
            console.log(element)
        } else {
            console.warn(`Element with ID diff-${idx} not found.`);
            setActiveDiffIndex(0);
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    const renderDiff = () => {
        let lineNumber = 1;
        let diffIdx = 0;
        const result = { left: [], right: [] };

        for (let idx = 0; idx < diff.length; idx++) {
            const part = diff[idx];
            const lines = part.value.split('\n');
            lines.pop();

            if (part.removed && idx + 1 < diff.length && diff[idx + 1].added) {
                const nextPart = diff[idx + 1];
                const nextLines = nextPart.value.split('\n');
                nextLines.pop();

                result.left.push(addDiffWithColor(lineNumber, diffIdx, lines[0], nextLines[0], 'lightcoral', 'left'));
                result.right.push(addDiffWithColor(lineNumber, diffIdx, nextLines[0], lines[0], 'lightgreen', 'right'));
  
                lineNumber++;
                diffIdx++;
                idx++;
            } else if (part.added) {
                for (const line of lines) {
                    result.right.push(createDiffElement(lineNumber, diffIdx, line, 'lightgreen'));
                    result.left.push(createDiffElement(lineNumber, diffIdx, "", "grey", ""));
                    lineNumber++;
                    diffIdx++;
                }
            } else if (part.removed) {
                for (const line of lines) {
                    result.left.push(createDiffElement(lineNumber, diffIdx, line, 'lightcoral'));
                    result.right.push(createDiffElement(lineNumber, diffIdx, "", "grey", ""));
                    lineNumber++;
                    diffIdx++;
                }
            } else {
                if (!showOnlyDiffs) {
                    for (const line of lines) {
                        result.left.push(addLeftDiff(lineNumber, diffIdx, line));
                        result.right.push(addRightDiff(lineNumber, diffIdx, line));
                        lineNumber++;
                    }
                }
            }
        }

        return result;
    };

    const DiffModal = ({ isOpen, diff, onClose }) => {
        if (!isOpen || !diff) return null;

        const baseText = diff.left;
        const changedText = diff.right;

        const diffDetail = diffChars(baseText, changedText);

        let baseLine = "";
        let changedLine = "";

        diffDetail.forEach((part) => {
            if (part.added) {
                changedLine += part.value;
            } else if (part.removed) {
                baseLine += part.value;
            } else {
                baseLine += part.value;
                changedLine += part.value;
            }
        });

        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '20%', height: '15%', backgroundColor: 'white', padding: '20px' }}>

                    <div style={{ maxHeight: 'calc(100% - 50px)', overflowX: 'auto', overflowY: 'hidden',whiteSpace: 'nowrap' }}>
                        <div style={{ marginBottom: '10px' }}>
                            {baseLine.split("").map((char, idx) => {
                                if (char !== changedText[idx]) {
                                    return <span key={idx} style={{ backgroundColor: 'lightcoral' }}>{char}</span>;
                                }
                                return char;
                            })}
                        </div>
                        <div>
                            {changedLine.split("").map((char, idx) => {
                                if (char !== baseText[idx]) {
                                    return <span key={idx} style={{ backgroundColor: 'lightgreen' }}>{char}</span>;
                                }
                                return char;
                            })}
                        </div>
                    </div>
                    <br />
                    <IconButton onClick={onClose}>
                        <CancelPresentationRounded />
                    </IconButton>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: 'rgb(255, 242, 243)', padding: '10px', boxShadow: '0px 4px 2px -2px gray', zIndex: 100 }}>
                <div style={{ verticalAlign: 'text-Bottom', height: '30px', fontSize: '18px', fontFamily: "'Itim', cursive" }}>
                    <FontAwesomeIcon icon={faCodeCompare} style={{color: "#037382",}} />
                    Config comparison tool
                </div>
                <Grid container>
                    <Grid item xs={2}>
                        <input ref={fileInputRef1} type="file" onChange={(e) => onFileChange(e, setFile1)} style={{ display: 'none' }} />
                        <input ref={fileInputRef2} type="file" onChange={(e) => onFileChange(e, setFile2)} style={{ display: 'none' }} />
                        <div style={{ display: 'inline-block', textAlign: 'center', marginRight: '10px' }}>
                            <Typography variant="caption" style={{ display: 'block', fontFamily: "'Itim', cursive" }}>File1</Typography>
                            <IconButton onClick={() => triggerFileInput(fileInputRef1)} color={file1 ? "primary" : "default"} >
                                <InsertDriveFileOutlined />
                            </IconButton>
                        </div>
                        <div style={{ display: 'inline-block', textAlign: 'center', marginRight: '10px' }}>
                            <Typography variant="caption" style={{ display: 'block', fontFamily: "'Itim', cursive" }}>File2</Typography>
                            <IconButton onClick={() => triggerFileInput(fileInputRef2)} color={file2 ? "primary" : "default"} >
                                <InsertDriveFileOutlined />
                            </IconButton>
                        </div>
                    </Grid>
                    <Grid item xs={2}>
                        <div style={{ display: 'inline-block', textAlign: 'center', marginRight: '10px' }}>
                            <Typography variant="caption" style={{ display: 'block', fontFamily: "'Itim', cursive" }}>Compare!!</Typography>
                            <IconButton onClick={compareFiles}>
                                <CompareIcon />
                            </IconButton>
                        </div>
                    </Grid>
                    <Grid item xs={2}>
                        <div style={{ display: 'inline-block', textAlign: 'center', marginRight: '10px' }}>
                            <Typography variant="caption" style={{ display: 'block', fontFamily: "'Itim', cursive" }}>Next Change</Typography>
                            <IconButton onClick={jumpToNextDiff}>
                                <FindReplace />
                            </IconButton>
                        </div>
                    </Grid>
                    <Grid item xs={6}>
                        <div style={{ display: 'inline-block', textAlign: 'center', marginRight: '10px' }}>
                            <Typography variant="caption" style={{ display: 'block', marginRight: '10px', fontFamily: "'Itim', cursive" }}>Exclude</Typography>
                            <input type="text" style={{ height: '20px', margin: '10px', fontFamily: "'Itim', cursive" }}placeholder="Exclude lines starting with..." value={excludePattern} onChange={(e) => setExcludePattern(e.target.value)} />
                        </div>
                        <FormControlLabel
                            style={{ marginTop: '-25px' }}
                            control={<Checkbox checked={showOnlyDiffs} onChange={(e) => setShowOnlyDiffs(e.target.checked)} />}
                            label={
                                <Typography variant="caption" style={{ display: 'block', fontFamily: "'Itim', cursive" }}>
                                    Show only differences
                                </Typography>
                            }
                            labelPlacement="top"
                        />
                    </Grid>
                </Grid>
            </div>
            <div style={{ paddingTop: '125px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <div style={{ whiteSpace: 'pre-line', flexGrow: 1 }}>
                        {diff && renderDiff().left}
                    </div>
                    <div style={{ whiteSpace: 'pre-line', flexGrow: 1 }}>
                        {diff && renderDiff().right}
                    </div>
                </div>
            </div>
            <DiffModal isOpen={isModalOpen} diff={selectedDiff} onClose={closeModal} />
        </div>
    );

}

export default App;
