from flask import Flask, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import csv
import jieba
import re
from math import log
import operator
import torch
from sklearn.feature_extraction.text import TfidfVectorizer

def remove_punctuation(text):
    cleaned_text = re.sub(r'[^\u4e00-\u9fa5\w\s]', '', text.replace('\n', ''))
    return cleaned_text

def segment_text(text):
    seg_list = list(jieba.cut(text))
    return seg_list

#round2要的資料
df = pd.read_csv('data.csv', header=None)
df.drop([3,4,5], axis=1,inplace=True)
data = df.values

name2doc = {}
for i in range(1,len(data)):
    if data[i][0] not in name2doc:
        name2doc[data[i][0]] = data[i][0] + '，' + data[i][1] + '，' + data[i][2]
    else:
        name2doc[data[i][0]] += '，' + data[i][0] + '，' + data[i][1] + '，' + data[i][2]

for name in name2doc:
    cleaned_text = remove_punctuation(name2doc[name])
    name2doc[name] = segment_text(cleaned_text)

#round2要的資料
df = pd.read_csv('data.csv', header=None)
df.drop([1,2,3], axis=1,inplace=True)
data = df.values

name2lat_lon = {}
for i in range(1,len(data)):
    if data[i][0] not in name2lat_lon:
        name2lat_lon[data[i][0]] = np.array([float(data[i][1]), float(data[i][2])])

df = pd.read_csv('label2name.csv', header=None)
label2name = df.values

label2names = {}
for item in label2name:
    if item[0] not in label2names:
        label2names[item[0]] = [item[1]]
    else:
        label2names[item[0]].append(item[1])

vocab = list(set(word for doc in name2doc.values() for word in doc))

collection_model = np.load('collection_model.npy')
collection_model = dict(collection_model)
collection_model = {k: float(v) for k, v in collection_model.items()}

####主程式####

app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.route('/firstQuery', methods=['POST'])
def firstQuery():
  #####主程式#####
  query = request.json["query"]
  cleaned_text = remove_punctuation(query)
  query_word_list = segment_text(cleaned_text)[:3000]

  lamb = 0.9
  name2likelihood = {}
  for name in name2doc: 
      likelihood = 0
      for w in query_word_list:
          if w in vocab:
              likelihood += log(lamb * ((name2doc[name].count(w)+1)/(len(name2doc[name])+len(vocab))) + (1-lamb) * collection_model[w])
          else:
              likelihood += log((name2doc[name].count(w)+1)/(len(name2doc[name])+len(vocab)))
      name2likelihood[name] = likelihood

  sorted_name2likelihood = sorted(name2likelihood.items(), key=operator.itemgetter(1), reverse=True)[:5]

  # print ()
  # print ('Recommendation results:')
  result = []
  for i, item in enumerate(sorted_name2likelihood):
      name, likelihood = item
      temp = {}
      temp["name"] = name
      temp["likelihood"] = likelihood
      result.append(temp)
  ################
  return result

@app.route('/secondQuery', methods=['POST'])
def secondQuery():
  #####主程式#####
  num = request.json["id"]
  round1 = request.json["name"]
  for label, names in label2names.items():
      if round1 in names:
        print(round1)
        target_label = label
        break
  
  target_names = label2names[target_label]
  name2distance = {}
  for name in target_names:
      if name != round1: 
          p1 = name2lat_lon[name]
          p2 = name2lat_lon[round1]
          distance = np.linalg.norm(p2 - p1)
          name2distance[name] = distance

  sorted_name2distance = sorted(name2distance.items(), key=operator.itemgetter(1), reverse=False)[:5]

  print ()
  print (f'與"{round1}"性質相近，且離"{round1}"近的地點有:')
  print ()
  print ('Recommendation results:')
  result = []
  for i, item in enumerate(sorted_name2distance):
      name, distance = item
      temp = {}
      temp["name"] = name
      temp["distance"] = distance
      result.append(temp)
      print(f'{i+1}, {name}')
  ################
  return result

if __name__ == "__main__":
  app.config['JSON_AS_ASCII'] = False
  app.run(debug=True)
