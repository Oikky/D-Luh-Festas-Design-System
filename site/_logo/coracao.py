import json, math
def heart(t): return (16*math.sin(t)**3, -(13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t)))
def gerar(dip=(781,768), tip=(745,872), t0=2.05, t1=-2.95, w0=16, w1=11, passo=26):
    vx,vy=tip[0]-dip[0],tip[1]-dip[1]; L=math.hypot(vx,vy); s=L/22
    ux,uy=vx/L,vy/L          # eixo local +y
    px,py=-uy,ux             # eixo local +x (direita do coração, olhando de frente)
    px,py=-px,-py
    def P(t):
        x,y=heart(t); y+=5
        return (dip[0]+(x*px+y*ux)*s, dip[1]+(x*py+y*uy)*s)
    dens=[P(t0+(t1-t0)*i/2000) for i in range(2001)]
    ac=[0]
    for i in range(1,len(dens)): ac.append(ac[-1]+math.dist(dens[i-1],dens[i]))
    n=round(ac[-1]/passo); out=[]; j=0
    for m in range(n+1):
        a=ac[-1]*m/n
        while j<len(ac)-2 and ac[j+1]<a: j+=1
        x,y=dens[j]; f=m/n
        out.append([round(x,1),round(y,1),round(w0+(w1-w0)*f**1.5,1)])
    # na covinha do meio: curva mais fechada
    return out
if __name__=='__main__':
    M=json.load(open('modelo-novo.json'))
    pts=M['laco']['pts'][:17]+[[651,891,19.6],[710,873.5,17.6]]
    h=gerar(t0=2.5)
    M['laco']['pts']=pts+h
    json.dump(M,open('modelo-novo.json','w'))
    print(h[0],h[-1],len(h))
