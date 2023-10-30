import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from tabulate import tabulate


file = pd.DataFrame(pd.read_excel('/Users/yuxinyuan/Desktop/personal-projects/data_practice/data.xlsx',header = 0, usecols = ['行标签','所属公司','租赁应收','物业应收']))
'''
print(file.shape)
print(file.info())
print(file['行标签'].dtype)
print(file.isnull())
print(file['行标签'].unique())
print(file.head(5))
file.rename(columns={"行标签":"名字"},inplace=True)
print(file.info())
print(file["所属公司"].value_counts())
'''

df = pd.DataFrame({'name':['Ella','John','Billy','Yuki'],'id':[55,16,4,7]})
df2 = pd.DataFrame({'id':[55,16,4,7],'year':['Freshman','Senior','Junior','Junior']})
df3 = pd.merge(df,df2,on=['id'],how='inner')
df4 = df3.sort_values(by=['id'])
df5 = pd.DataFrame({'Jack':[4,11,5],'Rose':[6,9,10]})
df6 = df5.sort_values(by = 0,axis = 1, ascending = False)
print(df6)
print(file)

plt.rcParams["font.sans-serif"]=["SimHei"]
plt.rcParams["axes.unicode_minus"]=False
labels = file['行标签']
bar1 = file['租赁应收']
bar2 = file['物业应收']
width = 0.5
x = np.arange(len(labels))
plt.xticks(x,labels)
plt.bar(x-width/2,bar1,width,label='租赁')
plt.bar(x+width/2,bar2,width,label='物业')
plt.ylabel('收入')
plt.show()




