import numpy as np
import matplotlib.pyplot as plt

x = np.arange(15) #from 0 to 14
x = np.zeros((2,3,6)) #2 is the highest level
y = [1,2,3,4]
b = [3,6,7,0]
z = np.array(y, dtype=np.int32)
a = z.astype(np.float64) #copy and change the type
c = np.array([[1,2,3],[4,5,6]])
array = np.arange(32).reshape(4,8)
array2 = array.T #change axes 
array3 = array.transpose(1,0) #the same as array2
#for 3d array, the original order is (0,1,2), 0 is the outermost level, 1 is row in the inner level, 2 is column, use 3d axis to understand it
#swapaxes is similar, swapaxes(1,2) means swap axis 1 and 2

#turn 1d arry to 2d
points = np.arange(-5,5,1)
xs,ys = np.meshgrid(points,points)
g = np.sqrt(xs ** 2 + ys ** 2)
#visualize
plt.imshow(g)
plt.show()

#where function, in this example, if array > 3, element is 0, otherwise is 1
result = np.where(array > 3, 0, 1)
print(result)
#for boolean array, sum function can be used to count the number of array
print((array > 3).sum())
#any() if there's true, all() if all true

#sort function, sort(1/0) used for 2d array
#unique(x), intersect1d(x,y) which calculates intersection and sort

#seed helps you generate the same set of random numbers 
np.random.seed(1)
rad1 = np.random.randn(10)
np.random.seed(1)
rad2 = np.random.randn(10)
print(rad1)
print(rad2)

mean = array.mean()
sum = array.sum()
mean1 = array.mean(axis = 1)
#1 means average of row, 0 is column

d = np.random.randn(4,3) #random ndarray
name = np.array(['A','B','A','C'])
new = d[name == 'A',1:].astype(np.int32) #use a condition applied to name as an index 
#to express not, use d[~(name == 'A)]
cond = (name == 'A') | (name == 'B') #multiple conditions are acceptable 
#slice, which will change the orginal array
array_slice = z[1:3]
array_slice[:] = 12 #a single : will select everything

#some function: sqrt, exp, maixmum(compare two arrays), modf(which returns two tuples, split decimals),isnan(the element is NaN or not)

print(a + b) #type is float64
print(b > a) #an ndarray of boolean
print(c[:1,2:]) #the first index is row and the second is column, :1 means leave the last 1 row 
print(d)
print(d[cond])
print(d[[1,0]]) #magic index, select from the ndarray in the inputing order
print(array)
print(array[[2,1],[1,2]]) #two magic index conditions, first row, second column
print(np.dot(array,array2)) #matrix multiplication
print(array3)
