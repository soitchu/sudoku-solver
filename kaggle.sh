#!/bin/bash

# Download the dataset
curl -L -o ./sudoku.zip \
  https://www.kaggle.com/api/v1/datasets/download/radcliffe/3-million-sudoku-puzzles-with-ratings

# Unzip the file
unzip sudoku.zip -d sudoku
mv sudoku/sudoku-3m.csv ./data/sudoku-3m.csv

# Clean up
rm -rf sudoku
rm sudoku.zip

# Download the second dataset
curl -L -o ./sudoku.zip \
  https://www.kaggle.com/api/v1/datasets/download/rohanrao/sudoku

# Unzip the file
unzip sudoku.zip -d ./data/9m
mv ./data/9m/sudoku.csv ./data/sudoku-9m.csv

# Clean up
rm sudoku.zip
rm -rf ./data/9m